import Token from './Token';
import { units } from './Unit';

export default class Pattern {
  public milliSecondToken: Token;
  public secondToken: Token;
  public minuteToken: Token;
  public hourToken: Token;
  public dayToken: Token;
  public monthToken: Token;
  public weekdayToken: Token;

  private pattern: string;

  constructor(pattern: string) {
    this.milliSecondToken = Object.create(null);
    this.secondToken = Object.create(null);
    this.minuteToken = Object.create(null);
    this.hourToken = Object.create(null);
    this.dayToken = Object.create(null);
    this.monthToken = Object.create(null);
    this.weekdayToken = Object.create(null);

    this.pattern = pattern;
  }

  static create(pattern: string): Pattern {
    const instance = new Pattern(pattern);
    instance.initToken();
    return instance;
  }

  public beginningUnitTokenToRestrict(): Token {
    let parts: Array<string> = this.patternParts();
    const len = parts.length;
    const unitLen = units.length;

    const index = unitLen - len;

    return this[`${units[index]}Token`];
  }

  private patternParts(): Array<string> {
    return this.pattern.split(' ');
  }

  private initToken(): void {
    let parts: Array<string> = this.patternParts();

    const len = parts.length;

    if (len < 5 || len > 7) throw new Error('Invalid pattern');
    if (len === 5) parts = ['*', '*'].concat(parts);
    if (len === 6) parts = ['*'].concat(parts);

    parts.forEach((part, i) =>
      this[`${units[i]}Token`] = Token.create(part, units[i])
    )
  }
}
