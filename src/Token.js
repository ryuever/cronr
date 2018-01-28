import { parse } from './tokenParser';
import Unit from './Unit';

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

  formatToParts() {
    if (!this.formatToPartsCache) this.formatToPartsCache = parse(this.token, this.unit);
    return this.formatToPartsCache;
  }
}
