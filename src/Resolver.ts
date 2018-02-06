import Pattern from './Pattern';
import { LITERAL, RANGE, EVERY } from './types';
import utils from './utils';
import { units, unitType, timeTypes, unitTypes } from './Unit';
import Token from './Token';

const { pick, sortByValue, min } = utils;

export interface IDateInfo {
  milliSecond: number,
  second: number,
  minute: number,
  hour: number,

  day: number,
  month: number,

  weekday: number,
};

export interface ResolverConstructor {
  id: string;
  pattern: string;
};

type Index = 'milliSecondToken' | 'secondToken' | 'minuteToken' | 'hourToken' | 'dayToken' | 'monthToken';
type indexSignature = {
  [k in Index]?: number;
}

// type IPattern(pattern: any)<A extends Pattern> = new (pattern: any) => A;

// Element implicitly has an 'any' type because type 'Resolver' has no index signature.

// interface IRawParams {
//   [key in Index]: any;
// }

// class Foo implements IRawParams {
//   [k: string]: any;
// }

interface withCallee {
  [k: string]: any;
}

declare class DateWithSignature extends Date {
  [k: string]: any;
};

export default class Resolver {
  public pattern: Pattern;
  public milliSecondToken: Token;
  public secondToken: Token;
  public minuteToken: Token;
  public hourToken: Token;
  public dayToken: Token;
  public monthToken: Token;
  public weekdayToken: Token;

  public ts: Date;
  public nextTs: Date | null;
  [k: string]: any;
  // [key in Index]: Token;

  constructor(opts: ResolverConstructor) {
    const { id, pattern } = opts;
    const patternInstance: Pattern = Pattern.create(pattern);

    const {
      milliSecondToken,
      secondToken,
      minuteToken,
      hourToken,
      dayToken,
      monthToken,
      weekdayToken
    } = patternInstance;

    this.pattern = patternInstance;

    this.milliSecondToken = milliSecondToken;
    this.secondToken = secondToken;
    this.minuteToken = minuteToken;
    this.hourToken = hourToken;
    this.dayToken = dayToken;
    this.monthToken = monthToken;
    this.weekdayToken = weekdayToken;

    this.ts = new Date();
    this.nextTs = null;
  }

  private match(unit: unitType, ts: Date): boolean{
    const info = this.calcTimeParts(ts);
    const token = this.getTokenByUnit(unit);
    return token.matchToken(info[unit]);
  }

  private matchTime(ts: Date): boolean{
    const matchSecond = this.match('second', ts);
    const matchMinute = this.match('minute', ts);
    const matchHour = this.match('hour', ts);

    return matchSecond && matchMinute && matchHour;
  }

  private matchDateOrWeekday(ts?: Date): boolean {
    const info = this.calcTimeParts();
    const { day, month, weekday } = info;

    const matchWeekday = this.weekdayToken.matchToken(weekday, info);
    const matchDate = this.dayToken.matchToken(day, info);

    return matchWeekday || matchDate;
  }

  private clone(ts: Date | number): Date {
    if (typeof ts === 'number') return new Date(ts);
    if (ts instanceof Date) return new Date(+ts);

    throw new Error('`clone` with invalid value');
  }

  private reverseTravelDiff(ts: Date, nextTs: Date): unitType {
    const orders: unitTypes = units.slice().reverse().slice(1);

    const tsTimeParts = this.calcTimeParts(ts);
    const nextTsTimeParts = this.calcTimeParts(nextTs);

    for (let unit of orders) {
      if (tsTimeParts[unit] !== nextTsTimeParts[unit]) return unit;
    }

    throw new Error('Failed to find ')
  }

  public next(): number {
    const nextTime = this.nextTimeToCall();
    let timeout = null;

    if (this.nextTs) {
      timeout = +nextTime - +this.nextTs;
    } else {
      timeout = +nextTime - +this.ts;
    }

    this.nextTs = nextTime;
    this.ts = new Date(+nextTime + this.nextTickOffset());

    return timeout;
  }

  public reset(): void {
    this.ts = this.nextTs = new Date();
  }

  public nextTimeToCall(): Date {
    let nextTs = this.ts;
    if (!this.matchDateOrWeekday()) {
      const nextDate = this.lookupDate(this.clone(nextTs));
      const unit = this.reverseTravelDiff(nextTs, nextDate);
      nextTs = this.normalizeFrom(unit, nextDate);
    }

    if (this.matchTime(nextTs)) return nextTs;

    const highOrderTime = this.lookupTime(nextTs);

    const diffUnit =  this.reverseTravelDiff(highOrderTime, this.nextTs || this.ts);
    const normalizedHighOrderTime = this.normalizeFrom(diffUnit, highOrderTime);
    const withDown = this.lookdownTime(normalizedHighOrderTime);

    return withDown;
  }

  private nextTickOffset(): number {
    const token = this.pattern.beginningUnitTokenToRestrict().resolvedOptions();
    return token.value;
  }

  private normalizeFrom(unit: unitType, ts: Date): Date {
    const unitOptions = this[`${unit}Token`].resolvedOptions();
    const { order: unitOrder } = unitOptions;
    const nextUnits = units.slice(0, -1);

    return nextUnits.reduce((nextTs: DateWithSignature, unit: unitType) => {
      const options = this.getTokenByUnit(unit).resolvedOptions();
      const { order, setCallee } = options;

      if (order < unitOrder) nextTs[setCallee](0);
      return nextTs;
    }, this.clone(ts))
  }

  private getTokenByUnit(unit: unitType): Token {
    return this[`${unit}Token`];
  }

  private getTokens(): Array<Token> {
    return units.map(unit => this[`${unit}Token`]);
  }

  private getHighOrderUnit(unit: unitType): unitType {
    const token: Token = this.getTokenByUnit(unit);
    const order: number = token.resolvedOptions().order;

    const nextOrder: number = order + 1;
    const tokens: Array<Token> = this.getTokens();

    const nextTokens: Array<Token> = tokens.filter(token => token.resolvedOptions().order === nextOrder);

    return nextTokens[0].resolvedOptions().unit;
  }

  private recalcHighOrder(unit: unitType, ts: Date): Date {
    const nextUnit: unitType = this.getHighOrderUnit(unit);

    const nextToken: Token = this.getTokenByUnit(nextUnit);
    const { value } = nextToken.resolvedOptions();

    const nextTs: Date = this.normalizeFrom(nextUnit, new Date(+ts + value));
    const nextValue: Date = this.lookup(nextUnit, nextTs);

    if (!nextValue) {
      return this.recalcHighOrder(nextUnit, ts);
    }

    return nextValue;
  }

  private findNext(unit: unitType, ts: Date): Date {
    let nextTs = ts;
    const token = this.getTokenByUnit(unit);
    const options = token.resolvedOptions();

    const { value, max } = options;

    const timeParts = this.calcTimeParts(nextTs);
    const nextMax = typeof max === 'function' ? max(timeParts) : max;

    for (let j = timeParts[unit]; j <= nextMax; j++) {
      if (this.match(unit, nextTs)) return nextTs;
      if (j !== nextMax) nextTs = new Date(+nextTs + value);
    }

    throw new Error('failed to find next value');
  }

  // to find the nearest value match on specified `unit`;
  private lookup(unit: unitType, ts: Date): Date {
    try {
      const ret = this.findNext(unit, ts);
      return ret;
    } catch(err) {
      return this.recalcHighOrder(unit, ts);
    }
  }

  private lookdownTime(ts: Date): Date {
    const unit = this.reverseTravelDiff(this.nextTs || this.ts, ts);

    const { order } = this.getTokenByUnit(unit).resolvedOptions();
    const tokenOptions = this.getTokens().map(token => token.resolvedOptions());
    const tokenOptionsWithLowerOrder = tokenOptions.filter(token => token.order <= order);

    tokenOptionsWithLowerOrder.sort((a, b) => b.order - a.order);

    return tokenOptionsWithLowerOrder.reduce((ts, options) => {
      const { unit } = options;
      return this.findNext(unit, ts);
    }, ts)
  }

  // first checking hour
  // then checking minute
  // finally checking second
  private lookupTime(ts: Date): Date {
    const bases: timeTypes = ['hour', 'minute', 'second'];
    let nextTs = ts;

    for (let base of bases) {
      if (!this.match(base, ts)) return this.lookup(base, ts);
    }
    return nextTs;
  }

  // only care day, month, year; then return a valid next date.
  private lookupDate(ts: Date): Date {
    const bases = ['day', 'month'];

    if (this.matchDateOrWeekday(ts)) return ts;

    let day = ts.getDate();
    let nextTs = ts;

    for(let i = 0; i < bases.length; i++) {
      const base = bases[i];
      const token = this[`${base}Token`];
      const options = token.resolvedOptions();

      const { value, max } = options;

      const timeParts = this.calcTimeParts(nextTs);
      const nextMax = typeof max === 'function' ? max(timeParts) : max;

      for (let j = day; j < nextMax; j++) {
        nextTs = new Date(nextTs + value);
        if (this.matchDateOrWeekday(nextTs)) return nextTs;
      }
    }

    throw new Error('failed to find high order date value');
  }

  calcTimeParts(ts?: Date): IDateInfo {
    const nextTs: Date = ts || this.ts;

    return {
      milliSecond: nextTs.getMilliseconds(),
      second: nextTs.getSeconds(),
      minute: nextTs.getMinutes(),
      hour: nextTs.getHours(),

      day: nextTs.getDate(),
      month: nextTs.getMonth(),

      weekday: nextTs.getDay(),
    }
  }
}
