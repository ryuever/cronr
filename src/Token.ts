import { unitType } from "./Unit";
import Unit, { assignFn } from "./Unit";
import { LITERAL, RANGE, EVERY } from "./tokenTypes";
import utils from "./utils";
import resolveTsParts, { IDateInfo } from "./utils/resolveTsParts";
import {
  parse,
  IParse,
  ILiteral,
  IEvery,
  IRange,
  parseResult
} from "./tokenParser";

const { toNum } = utils;

export interface IToken {
  resolvedOptions(): Unit;
  matchToken(data: number, dateInfo?: IDateInfo): boolean;
  formatToParts(): IParse;
}

export default class Token implements IToken {
  public pattern: string;
  public unit: unitType;
  public resolvedOptionsCache: Unit;
  public formatToPartsCache: IParse;

  constructor(pattern: string, unit: unitType) {
    this.pattern = pattern;
    this.unit = unit;
  }

  static create(pattern: string, unit: unitType): Token {
    return new Token(pattern, unit);
  }

  public resolvedOptions(): Unit {
    const ret = {};
    if (!this.resolvedOptionsCache) {
      this.resolvedOptionsCache = Unit.instance(this.unit);
    }

    return this.resolvedOptionsCache;
  }

  public matchToken(data: number, dateInfo?: IDateInfo): boolean {
    const parts = this.formatToParts();

    const literalParts: Array<ILiteral> = parts.filter(
      (part): part is ILiteral => part.type === LITERAL
    );
    const everyParts: Array<IEvery> = parts.filter(
      (part): part is IEvery => part.type === EVERY
    );
    let rangeParts: Array<IRange> = parts.filter(
      (part): part is IRange => part.type === RANGE
    );

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

    if (typeof max === "function" && dateInfo)
      nextMax = (max as assignFn)(dateInfo);

    // only if has type 'EVERY' will provide defualt rangeParts;
    if (rangeParts.length === 0 && everyParts.length > 0) {
      rangeParts = [
        {
          type: RANGE,
          value: { from: min, to: nextMax }
        }
      ];
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

  /**
   * value should be included
   * Because the `max` value of `month` should be determined by `year` and `month`;
   * there is a need of `ts` param;
   */
  public findTheClosestValidValue(value: number, ts: Date) {
    const { max, min } = this.resolvedOptions();
    const info = resolveTsParts(ts);

    let nextMax = max;
    if (typeof nextMax === "function") {
      const year = ts.getFullYear();
      const month = ts.getMonth();
      nextMax = nextMax(info);
    }

    for (let i = value; i >= min && i <= nextMax; i++) {
      if (this.matchToken(i, info)) {
        return i;
      }
    }

    throw new Error("Maybe you should carry over the number, then match again");
  }

  public findTheClosestValidValueForWeekday(value: number, ts: Date) {
    const { affiliatedMax, min } = this.resolvedOptions();
    const info = resolveTsParts(ts);
    const clone = new Date(toNum(ts));

    if (!affiliatedMax) return;

    const year = ts.getFullYear();
    const month = ts.getMonth();
    const nextMax = affiliatedMax(info);

    for (let i = value; i >= min && i <= nextMax; ) {
      const { weekday } = resolveTsParts(clone);
      if (this.matchToken(weekday, info)) {
        return i;
      }

      i++;
      clone.setDate(i);
    }

    throw new Error("Maybe you should carry over the number, then match again");
  }

  public formatToParts(): IParse {
    if (!this.formatToPartsCache)
      this.formatToPartsCache = parse(this.pattern, this.unit);
    return this.formatToPartsCache;
  }
}
