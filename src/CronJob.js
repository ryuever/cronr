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
      secondToken,
      minuteToken,
      hourToken,
      dayToken,
      monthToken,
      weekdayToken
    } = patternInstance;

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

  ifDateUpdated(ts, nextTs) {
    const tsDate = `${ts.getFullYear()}-${ts.getMonth()}-${ts.getDate()}`;
    const nextTsDate = `${nextTs.getFullYear()}-${nextTs.getMonth()}-${nextTs.getDate()}`;

    return tsDate !== nextTsDate;
  }

  nextTimeToCall() {
    let nextTs = this.ts;
    if (!this.matchDateOrWeekday()) {
      const nextDate = this.lookupDate(clone(nextTs));
      const unit = this.reverseTravelDiff(nextTs, nextDate);
      nextTs = this.normalizeFrom(unit, nextDate);
    }

    if (this.matchTime(nextTs)) return nextTs;

    return this.lookupTime(nextTs);
  }

  normalizeFrom(unit, ts) {
    const unitOptions = this[`${unit}Token`].resolvedOptions;
    const { order: unitOrder } = unitOptions;

    const units = ['milliSecond', 'second', 'minute', 'hour', 'day', 'month'];

    return units.reduce((prev, cur) => {
      const options = this[`${prev}Token`].resolvedOptions;
      const { order, setCallee } = options;
      if (order < unitOrder) nextDate[setCallee](0);
      return nextDate;
    }, nextDate)
  }

  getTokenByUnit(unit) {
    console.log('token : ', this[`${unit}Token`], unit);
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

    console.log('unit : ', unit, token.resolvedOptions(), tokens, nextOrder);

    return (tokens.filter(token => token.resolvedOptions().order === nextOrder))[0].resolvedOptions().unit;
  }

  recalcHighOrder(unit, ts) {
    const nextUnit = this.getHighOrderUnit(unit);

    console.log('next and current : ', unit, nextUnit);

    const nextToken = this.getTokenByUnit(nextUnit);
    const { value } = nextToken.resolvedOptions();

    const nextTs = ts + value;
    const nextValue = this.lookup(nextUnit, nextTs);

    if (!nextValue) {
      return this.recalcHighOrder(nextUnit, ts);
    }

    return nextValue;
  }

  // to find the nearest value match on specified `unit`;
  lookup(unit, ts) {
    let nextTs = ts;
    const token = this.getTokenByUnit(unit);
    const options = token.resolvedOptions;

    const { value, max } = options;
    const timeParts = this.calcTimeParts(nextTs);
    const nextMax = typeof max === 'function' ? max(timeParts) : max;

    for (let j = timeParts.day; j < nextMax; j++) {
      nextTs = new Date(nextTs + value);
      if (this.match(unit, nextTs)) return nextTs;
    }

    return this.recalcHighOrder(unit, nextTs);
  }

  // first checking hour
  // then checking minute
  // finally checking second
  lookupTime(ts) {
    // const bases = ['second', 'minute', 'hour'];
    let nextTs = ts;

    // to use reduce
    if (!this.match('hour', ts)) {
      const nextHour = this.lookup('hour', ts);
      nextTs = this.normalizeFrom('hour', nextTs);
    }

    if (!this.match('minute', ts)) {
      const nextMinute = this.lookup('minute', ts);
      nextTs = this.normalizeFrom('minute', nextTs);
    }

    if (!this.match('second', ts)) {
      const nextSecond = this.lookup('second', ts);
      nextTs = this.normalizeFrom('second', nextTs);
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
      const options = token.resolvedOptions;

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

    console.log('ts : ', Object.prototype.toString.call(nextTs));

    return {
      // millisecond: nextTs.getMilliseconds(),
      second: nextTs.getSeconds(),
      minute: nextTs.getMinutes(),
      hour: nextTs.getHours(),

      day: nextTs.getDate(),
      month: nextTs.getMonth(),

      weekday: nextTs.getDay(),
    }
  }

  // bestValueInRange(base, parts, opts) {
  //   const { from, to, step, loop } = Object.assign({
  //     step: 1,
  //     loop: 60,
  //   }, opts || {})

  //   let nextParts = [];

  //   if (parts.length === 0) {
  //     if (!opts) return;

  //     nextParts = [{ value: { from, to } }];
  //   }

  //   parts.length > 0 ? nextParts = parts : null;

  //   return nextParts.reduce((prev, { value: { from, to }}) => {
  //     for (let i = from; i < to; i = i + step) {
  //       if (i >= base) return typeof prev !== 'undefined' ? min([prev, i]) : i;
  //     }

  //     if (prev) return prev;
  //     return from + loop;
  //   }, undefined)
  // }

  // bestValueInLiteral(base, parts, loop) {
  //   parts.sort(sortByValue);
  //   if (parts.length === 0) return;

  //   const v = parts.reduce((prev, { value }) => {
  //     return value >= base ? value : undefined;
  //   }, undefined)

  //   if (typeof v === 'undefined') return parts[0].value + loop;
  //   return v;
  // }

  // _calNext(unit, opts) {
  //   const base = this.calcTimeParts()[unit];
  //   const { from, to, loop } = pick(opts, ['from', 'to', 'loop']);

  //   const parts = this[`${unit}Token`].formatToParts();

  //   const literalParts = parts.filter(({ type }) => type === LITERAL);
  //   const rangeParts = parts.filter(({ type }) => type === RANGE);
  //   const everyParts = parts.filter(({ type }) => type === EVERY).sort(sortByValue);

  //   if (everyParts.length > 0) {
  //     const { value: step } = everyParts[0];

  //     const ret = this.bestValueInRange(base, rangeParts, { from, to, loop, step });
  //     return ret;
  //   }

  //   const valueFromLiteral = this.bestValueInLiteral(base, literalParts, loop);
  //   const valueFromRange = this.bestValueInRange(base, rangeParts);
  //   const value = min([valueFromLiteral, valueFromRange]);

  //   return value - base;
  // }

  // nextSecond() {
  //   return this._calNext('second', {
  //     from: 1,
  //     to: 59,
  //     loop: 60,
  //   });
  // }

  // nextMinute() {
  //   return this._calNext('minute', {
  //     from: 1,
  //     to: 59,
  //     loop: 60,
  //   });
  // }

  // nextHour() {
  //   return this._calNext('hour', {
  //     from: 0,
  //     to: 23,
  //     loop: 24,
  //   });
  // }

  // nextMonth() {
  //   return this._calNext('month', {
  //     from: 0,
  //     to: 11,
  //     loop: 12,
  //   });
  // }

  // nextTimeToCall() {
  //   const second = this.nextSecond();
  //   const minute = this.nextMinute();
  //   const hour = this.nextHour();
  //   const month = this.nextMonth();

  //   return {
  //     second,
  //     minute,
  //     hour,
  //     month,
  //   }
  // }
}
