import { parse, IParse, ILiteral, IEvery, IRange, parseResult } from './tokenParser';
import { unitType }from './Unit';
import Unit from './Unit';
import { LITERAL, RANGE, EVERY } from './types';
import { IDateInfo } from './Resolver';

export interface IToken {
  resolvedOptions(): Unit,
  matchToken(data: number, dateInfo?: IDateInfo) : boolean;
  formatToParts(): IParse,
};

export default class Token implements IToken {
  public token: string;
  public unit: unitType;
  public resolvedOptionsCache: Unit;
  public formatToPartsCache: IParse;

  constructor(token: string, unit: unitType) {
    this.token = token;
    this.unit = unit;
  }

  static create(token: string, unit: unitType): Token {
    return new Token(token, unit);
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

    const literalParts: Array<ILiteral> = parts.filter((part): part is ILiteral => part.type === LITERAL);
    const everyParts: Array<IEvery>  = parts.filter((part): part is IEvery => part.type === EVERY);
    let rangeParts: Array<IRange> = parts.filter((part): part is IRange => part.type === RANGE);

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
      rangeParts = [{
        type: RANGE,
        value: { from: min, to: nextMax }
      }];
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

  public formatToParts(): IParse {
    if (!this.formatToPartsCache) this.formatToPartsCache = parse(this.token, this.unit);
    return this.formatToPartsCache;
  }
}
