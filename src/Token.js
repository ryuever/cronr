import { parse } from './tokenParser';
import Unit from './Unit';
import { LITERAL, RANGE, EVERY } from './types';

export default class Token {
  constructor(token, unit) {
    this.token = token;
    this.unit = unit;
  }

  static create(token, unit) {
    return new Token(token, unit);
  }

  resolvedOptions() {
    const ret = {};
    if (!this.resolvedOptionsCache) {
      this.resolvedOptionsCache = Unit.instance(this.unit);
    }

    return this.resolvedOptionsCache;
  }

  matchToken(data, dateInfo) {
    const parts = this.formatToParts();

    const literalParts = parts.filter(({ type }) => type === LITERAL);
    const everyParts = parts.filter(({ type }) => type === EVERY);
    let rangeParts = parts.filter(({ type }) => type === RANGE);

    for (let i of literalParts) {
      const { value } = i;
      if (value === data) return true;
    }

    let step = 1;

    if (everyParts.length > 0) {
      step = everyParts[0].value;
    }

    // pending to calculate day count
    const { min, max } = this.resolvedOptions();
    let nextMax = max;

    if (typeof max === 'function') nextMax = max(dateInfo);

    // only if has type 'EVERY' will provide defualt rangeParts;
    if (rangeParts.length === 0 && everyParts.length > 0) {
      rangeParts = [{ value: { from: min, to: nextMax }}];
    }

    for (let i of rangeParts) {
      const from = i.value.from || min;
      const to = i.value.to || nextMax;

      for (let i = from; i <= to; i = i + step) {
        if (data === i) return true;
      }
    }

    return false;
  }

  formatToParts() {
    if (!this.formatToPartsCache) this.formatToPartsCache = parse(this.token, this.unit);
    return this.formatToPartsCache;
  }
}
