import Token from './Token';
import { units } from './Unit';

export default class Pattern {
  constructor(pattern) {
    this.milliSecondToken = Object.create(null);
    this.secondToken = Object.create(null);
    this.minuteToken = Object.create(null);
    this.hourToken = Object.create(null);
    this.dayToken = Object.create(null);
    this.monthToken = Object.create(null);
    this.weekdayToken = Object.create(null);

    this.pattern = pattern;
    this.times = Infinity;
  }

  static create(pattern) {
    const instance = new Pattern(pattern);
    instance.initToken();
    return instance;
  }

  initToken() {
    let parts = this.pattern.split(' ');

    const len = parts.length;

    if (len < 5 || len > 7) throw new Error('Invalid pattern');
    if (len === 5) parts = ['*', '*'].concat(parts);
    if (len === 6) parts = ['*'].concat(parts);

    parts.forEach((part, i) =>
      this[`${units[i]}Token`] = Token.create(part, units[i])
    )
  }

  resolveOptions() {
    return {
      // watchUnit
    }
  }
}
