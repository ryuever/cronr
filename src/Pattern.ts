import Token from "./Token";
import { units } from "./Unit";

const MILLISECOND_BASED = Symbol("millisecond_base");
const SECOND_BASED = Symbol("second_based");
const MINUTE_BASED = Symbol("minute_base");

export default class Pattern {
  public milliSecondToken: Token;
  public secondToken: Token;
  public minuteToken: Token;
  public hourToken: Token;
  public dayToken: Token;
  public monthToken: Token;
  public weekdayToken: Token;

  private pattern: string;

  [k: string]: any;

  constructor(pattern: string) {
    this.milliSecondToken = Object.create(null);
    this.secondToken = Object.create(null);
    this.minuteToken = Object.create(null);
    this.hourToken = Object.create(null);
    this.dayToken = Object.create(null);
    this.monthToken = Object.create(null);
    this.weekdayToken = Object.create(null);

    this.pattern = pattern;
    this.type = MILLISECOND_BASED;
  }

  static create(pattern: string): Pattern {
    const instance = new Pattern(pattern);
    instance.initToken();
    return instance;
  }

  private patternParts(): Array<string> {
    return this.pattern.split(" ");
  }

  /**
   * The first one which is not `*` will determine the next timestamp's plus step.
   */
  public resolveStep(): number {
    const len = this.fullPatternParts.length;

    let i = 0;

    for (; i < len; i++) {
      if (this.fullPatternParts[i] !== "*") {
        break;
      }
    }

    if (i !== len) {
      const options = this[`${units[i]}Token`].resolvedOptions();
      return options.step;
    }

    switch (this.type) {
      case MILLISECOND_BASED:
        return 1;
      case SECOND_BASED:
        return 1 * 1000;
      case MINUTE_BASED:
        return 1 * 60 * 1000;
      default:
        return 1;
    }
  }

  private initToken(): void {
    let parts: Array<string> = this.patternParts();

    const len = parts.length;

    if (len < 5 || len > 7) throw new Error("Invalid pattern");
    if (len === 5) {
      parts = ["*", "*"].concat(parts);
      this.type = MINUTE_BASED;
    }
    if (len === 6) {
      parts = ["*"].concat(parts);
      this.type = SECOND_BASED;
    }

    this.fullPatternParts = parts;

    parts.forEach(
      (part, i) => (this[`${units[i]}Token`] = Token.create(part, units[i]))
    );
  }
}
