import Pattern from './Pattern';
import { LITERAL, RANGE, EVERY } from './types';

const sortByValue = (a, b) => {
  const { value: va } = a;
  const { value: vb } = b;

  return va - vb;
}

const min = (arr) => {
  return arr.reduce((prev, cur) => {
    if (cur) return typeof prev !== 'undefined' ? Math.min(prev, cur): cur;
    return prev;
  })

  return;
}

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
  }

  nextTimeToCall() {
    const nextSecond = this.nextSecond();

    const ret = {
      second: nextSecond,
    }
    return ret;
  }

  nextSecond() {
    const { second } = this.currentTimeParts();

    const parts = this.secondToken.formatToParts();

    const literalParts = parts.filter(({ type }) => type === LITERAL);
    const rangeParts = parts.filter(({ type }) => type === RANGE);
    const everyParts = parts.filter(({ type }) => type === EVERY).sort(sortByValue);

    if (everyParts.length > 0) {
      const { value: step } = everyParts[0];

      const ret = this.bestValueInRange(second, rangeParts, {
        from: 1,
        to: 59,
        loop: 60,
        step,
      });
      return ret;
    }

    const valueFromLiteral = this.bestValueInLiteral(second, literalParts, 60);
    const valueFromRange = this.bestValueInRange(second, rangeParts);
    const value = min([valueFromLiteral, valueFromRange]);

    return value - second;
  }

  bestValueInRange(base, parts, opts) {
    const { from, to, step, loop } = Object.assign({
      step: 1,
      loop: 60,
    }, opts || {})

    let nextParts = [];

    if (parts.length === 0) {
      if (!opts) return;

      nextParts = [{ value: { from, to } }];
    }

    parts.length > 0 ? nextParts = parts : null;

    return nextParts.reduce((prev, { value: { from, to }}) => {
      for (let i = from; i < to; i = i + step) {
        if (i >= base) return typeof prev !== 'undefined' ? min([prev, i]) : i;
      }

      if (prev) return prev;
      return from + loop;
    }, undefined)
  }

  bestValueInLiteral(base, parts, loop) {
    parts.sort(sortByValue);
    if (parts.length === 0) return;

    const v = parts.reduce((prev, { value }) => {
      return value >= base ? value : undefined;
    }, undefined)

    if (typeof v === 'undefined') return parts[0].value + loop;
    return v;
  }

  currentTimeParts() {
    return {
      second: this.start.getSeconds(),
      minute: this.start.getMinutes(),
      hour: this.start.getHours(),

      day: this.start.getDate(),
      month: this.start.getMonth(),

      weekday: this.start.getDay(),
    }
  }
}
