import Pattern from "./Pattern";
import { LITERAL, RANGE, EVERY } from "./types";
import utils from "./utils";
import { units, unitType, timeTypes, unitTypes } from "./Unit";
import Token from "./Token";
import resolveTsParts, { IDateInfo } from "./utils/resolveTsParts";

const { pick, min } = utils;

export interface ResolverConstructor {
  id: string;
  pattern: string;
  ts: Date | null;
}

type Index =
  | "milliSecondToken"
  | "secondToken"
  | "minuteToken"
  | "hourToken"
  | "dayToken"
  | "monthToken";
type indexSignature = { [k in Index]?: number };

interface withCallee {
  [k: string]: any;
}

declare class DateWithSignature extends Date {
  [k: string]: any;
}

const toNum: (t: Date) => number = (date: Date): number => date.valueOf();

export default class Resolver {
  public pattern: Pattern;
  public milliSecondToken: Token;
  public secondToken: Token;
  public minuteToken: Token;
  public hourToken: Token;
  public dayToken: Token;
  public monthToken: Token;
  public weekdayToken: Token;

  public originTs: Date;
  public ts: Date;
  public nextTs: Date | null;
  [k: string]: any;

  constructor(opts: ResolverConstructor) {
    const { id, pattern, ts } = opts;
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

    // `originTs` served as the base ts; It aims to calculate to nextTs's offset.
    this.originTs = ts || new Date();
    // plus one millisecond
    // this.ts = new Date(toNum(this.originTs) + 1);
    this.ts = new Date(toNum(this.originTs));
    this.nextTs = null;
  }

  public [Symbol.iterator]() {
    return {
      next: () => {
        const nextTime = this.nextTimeToCall();
        const step = this.pattern.resolveStep();

        this.ts = new Date(toNum(nextTime) + step);
        return {
          value: nextTime,
          done: false
        };
      }
    };
  }

  /**
   * Accroding to the time pattern and this.ts to calculate the nextTime
   * abide to the `cron time pattern`
   */
  public nextTimeToCall(): Date {
    const len = units.length;
    this.traverse(units[len - 2], this.ts);
    return this.ts;
  }

  private normalizeTsValueAfterUnit(
    unit: unitType,
    ts: DateWithSignature,
    inclusive?: boolean
  ) {
    const index = units.indexOf(unit);
    let max = index;

    if (inclusive) {
      max = index + 1;
    }

    for (let i = 0; i < max; i++) {
      const unit = units[i];
      const token = this.getTokenByUnit(unit);
      const options = token.resolvedOptions();
      const { setCallee, min } = options;
      ts[setCallee](min);
    }
  }

  private decorateTsWithClosestValidValueAfterUnit(
    unit: unitType,
    ts: DateWithSignature,
    inclusive?: boolean
  ) {
    const index = units.indexOf(unit);
    let max = index;

    if (inclusive) {
      max = index + 1;
    }

    for (let i = 0; i < max; i++) {
      const unit = units[i];
      const token = this.getTokenByUnit(unit);
      const value = resolveTsParts(ts)[unit];
      const newValue = token.findTheClosestValidValue(value, ts);
      const options = token.resolvedOptions();
      const { setCallee } = options;
      ts[setCallee](newValue);
    }
  }

  private traverse(unit: unitType, ts: DateWithSignature) {
    const index = units.indexOf(unit);
    const token = this.getTokenByUnit(unit);
    const info = resolveTsParts(ts);
    const value = info[unit];

    if (!this.checkIfTokenMatchsValue(token, value, info)) {
      try {
        const validValue = this.findTokenClosestValidValue(token, value, ts);
        const { setCallee } = token.resolvedOptions();
        ts[setCallee](validValue);
        this.normalizeTsValueAfterUnit(unit, ts);
        this.decorateTsWithClosestValidValueAfterUnit(unit, ts);
        return;
      } catch (err) {
        if (unit !== "month") {
          const parentUnit = units[index + 1];
          const parentToken = this.getTokenByUnit(parentUnit);
          const { setCallee } = parentToken.resolvedOptions();
          const parentValue = info[parentUnit];
          ts[setCallee](parentValue + 1);
          this.normalizeTsValueAfterUnit(parentUnit, ts);
          this.traverse(parentUnit, ts);
        } else {
          const year = ts.getFullYear();
          ts.setFullYear(year + 1);
          this.normalizeTsValueAfterUnit(unit, ts, true);
          this.decorateTsWithClosestValidValueAfterUnit(unit, ts, true);
        }
        return;
      }
    }
    if (index > 0) {
      this.traverse(units[index - 1], ts);
    }
  }

  private checkIfTokenMatchsValue(
    token: Token,
    value: number,
    info: IDateInfo
  ) {
    const unit = token.unit;
    if (unit !== "day") {
      return token.matchToken(value, info);
    }

    const weekdayToken = this.getTokenByUnit("weekday");
    const dayPattern = token.pattern;
    const weekdayPattern = weekdayToken.pattern;

    if (weekdayPattern === "*" && dayPattern === "*") return true;

    const dayMatch = token.matchToken(value, info);
    const weekdayMatch = weekdayToken.matchToken(info.weekday, info);
    if (weekdayPattern === "*" && dayPattern !== "*") return dayMatch;
    if (weekdayPattern !== "*" && dayPattern === "*") return weekdayMatch;
    return dayMatch || weekdayMatch;
  }

  private findTokenClosestValidValue(
    token: Token,
    value: number,
    ts: DateWithSignature
  ) {
    const unit = token.unit;

    if (unit !== "day") {
      return token.findTheClosestValidValue(value, ts);
    }

    const info = resolveTsParts(ts);

    const weekdayToken = this.getTokenByUnit("weekday");
    const dayPattern = token.pattern;
    const weekdayPattern = weekdayToken.pattern;
    if (weekdayPattern === "*" && dayPattern === "*") return value;

    const dayMatch = token.matchToken(value, info);
    const weekdayMatch = weekdayToken.matchToken(info.weekday, info);

    let valueFromDayUnit = null;
    let valueFromWeekdayUnit = null;

    try {
      valueFromDayUnit = token.findTheClosestValidValue(value, ts);
    } catch (err) {
      if (weekdayPattern === "*" && dayPattern !== "*") throw err;
    }

    if (weekdayPattern === "*" && dayPattern !== "*") return valueFromDayUnit;

    try {
      valueFromWeekdayUnit = weekdayToken.findTheClosestValidValueForWeekday(
        value,
        ts
      );
    } catch (err) {
      if (weekdayPattern !== "*" && dayPattern === "*") throw err;
    }

    if (weekdayPattern !== "*" && dayPattern === "*")
      return valueFromWeekdayUnit;

    if (valueFromDayUnit && valueFromWeekdayUnit) {
      return Math.min(valueFromDayUnit, valueFromWeekdayUnit);
    }

    throw new Error("Carry over to fetch again");
  }

  private getTokenByUnit(unit: unitType): Token {
    return this[`${unit}Token`];
  }
}
