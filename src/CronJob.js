import Pattern from './Pattern';
import { LITERAL, RANGE, EVERY } from './types';
import utils from './utils';
import { units } from './Unit';

const { pick, sortByValue, min } = utils;

export default class CronJob {
  constructor(opts) {
    const { id, fn, pattern } = opts;
    const patternInstance = Pattern.create(pattern);

    const {
      milliSecondToken,
      secondToken,
      minuteToken,
      hourToken,
      dayToken,
      monthToken,
      weekdayToken
    } = patternInstance;

    this.milliSecondToken = milliSecondToken;
    this.secondToken = secondToken;
    this.minuteToken = minuteToken;
    this.hourToken = hourToken;
    this.dayToken = dayToken;
    this.monthToken = monthToken;
    this.weekdayToken = weekdayToken;

    this.start = new Date();

    this.ts = new Date();
    this.nextTs = null;
  }

  match(unit, ts) {
    const info = this.calcTimeParts(ts);
    const token = this.getTokenByUnit(unit);
    return token.matchToken(info[unit]);
  }

  matchTime(ts) {
    const matchSecond = this.match('second', ts);
    const matchMinute = this.match('minute', ts);
    const matchHour = this.match('hour', ts);

    return matchSecond && matchMinute && matchHour;
  }

  matchDateOrWeekday() {
    const info = this.calcTimeParts();
    const { day, month, weekday } = info;

    const matchWeekday = this.weekdayToken.matchToken(weekday, info);
    const matchDate = this.dayToken.matchToken(day, info);

    return matchWeekday || matchDate;
  }

  clone(ts) {
    if (typeof ts === 'number') return new Date(ts);
    if (ts instanceof Date) return new Date(+ts);
  }

  reverseTravelDiff(ts, nextTs) {
    const orders = ['month', 'day', 'hour', 'minute', 'second', 'milliSecond'];

    const tsTimeParts = this.calcTimeParts(ts);
    const nextTsTimeParts = this.calcTimeParts(nextTs);

    for (let unit of orders) {
      if (tsTimeParts[unit] !== nextTsTimeParts[unit]) return unit;
    }
  }

  nextTimeout() {
    const nextTime = this.nextTimeToCall();
    let timeout = null;

    if (this.nextTs) {
      timeout = +nextTime - +this.nextTs;
    } else {
      timeout = +nextTime - this.ts;
    }

    this.nextTs = nextTime;

    return timeout;
  }

  nextTimeToCall() {
    let nextTs = this.ts;
    if (!this.matchDateOrWeekday()) {
      const nextDate = this.lookupDate(clone(nextTs));
      const unit = this.reverseTravelDiff(nextTs, nextDate);
      nextTs = this.normalizeFrom(unit, nextDate);
    }

    if (this.matchTime(nextTs)) return nextTs;

    const highOrderTime = this.lookupTime(nextTs);
    const withDown = this.lookdownTime(highOrderTime);

    return withDown;
  }

  normalizeFrom(unit, ts) {
    const unitOptions = this[`${unit}Token`].resolvedOptions();
    const { order: unitOrder } = unitOptions;

    const units = ['milliSecond', 'second', 'minute', 'hour', 'day', 'month'];

    return units.reduce((nextTs, unit) => {
      const options = this.getTokenByUnit(unit).resolvedOptions();
      const { order, setCallee } = options;

      if (order < unitOrder) nextTs[setCallee](0);
      return nextTs;
    }, this.clone(ts))
  }

  getTokenByUnit(unit) {
    return this[`${unit}Token`];
  }

  getTokens() {
    return units.map(unit => this[`${unit}Token`]);
  }

  getHighOrderUnit(unit) {
    const token = this.getTokenByUnit(unit);
    const { order } = token.resolvedOptions();

    const nextOrder = order + 1;
    const tokens = this.getTokens();

    const nextTokens = tokens.filter(token => token.resolvedOptions().order === nextOrder);

    return nextTokens[0].resolvedOptions().unit;
  }

  recalcHighOrder(unit, ts) {
    const nextUnit = this.getHighOrderUnit(unit);

    const nextToken = this.getTokenByUnit(nextUnit);
    const { value } = nextToken.resolvedOptions();

    const nextTs = this.normalizeFrom(nextUnit, new Date(+ts + value));
    const nextValue = this.lookup(nextUnit, nextTs);

    if (!nextValue) {
      return this.recalcHighOrder(nextUnit, ts);
    }

    return nextValue;
  }

  findNext(unit, ts) {
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

    return;
  }

  // to find the nearest value match on specified `unit`;
  lookup(unit, ts) {
    const ret = this.findNext(unit, ts);
    if (ret) return ret;
    return this.recalcHighOrder(unit, ts);
  }

  lookdownTime(ts) {
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
  lookupTime(ts) {
    // const bases = ['second', 'minute', 'hour'];
    let nextTs = ts;

    // to use reduce
    if (!this.match('hour', ts)) {
      return this.lookup('hour', ts);
    }

    if (!this.match('minute', ts)) {
      return this.lookup('minute', ts);
    }

    if (!this.match('second', ts)) {
      return this.lookup('second', ts);
    }

    return nextTs;
  }

  // only care day, month, year; then return a valid next date.
  lookupDate(ts) {
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
        if (this.matchDateOrWeekday(nextDay)) return nextDay;
      }
    }
  }

  calcTimeParts(ts) {
    const nextTs = ts || this.ts;
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
