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
  }

  static create(pattern) {
    const instance = new Pattern(pattern);
    instance.initToken();
    return instance;
  }

  beginningUnitTokenToRestrict() {
    let parts = this.patternParts();
    const len = parts.length;
    const unitLen = units.length;

    const index = unitLen - len;

    return this[`${units[index]}Token`];
  }

  patternParts() {
    return this.pattern.split(' ');
  }

  initToken() {
    let parts = this.patternParts();

    const len = parts.length;

    if (len < 5 || len > 7) throw new Error('Invalid pattern');
    if (len === 5) parts = ['*', '*'].concat(parts);
    if (len === 6) parts = ['*'].concat(parts);

    parts.forEach((part, i) =>
      this[`${units[i]}Token`] = Token.create(part, units[i])
    )
  }
}
