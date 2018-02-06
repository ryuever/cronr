import utils from './utils';
const { isLeap } = utils;

export const units: unitTypes = [
  'milliSecond',
  'second',
  'minute',
  'hour',
  'day',
  'month',
  'weekday'
];

export type timeType = 'milliSecond' | 'second' | 'minute' | 'hour';
export type dateType = 'day' | 'month' | 'weekday';
export type unitType = timeType | dateType;
export type unitTypes = Array<unitType>;
export type timeTypes = Array<timeType>;
export type dateTypes = Array<dateType>;

const nonLeapLadder = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const leapLadder = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
let singletonInstance = Object.create(null);
const unitBase = 1000;

export type assignFn = (opt: {
  month?: number,
  year?: number,
}) => number;

export interface IUnit {
  unit: unitType,
  value: number,
  max: number | assignFn,
  min: number,
  order: number,
  setCallee: string,
};

export default class Unit {
  public unit: unitType;
  public value: number;
  public max: number | assignFn;
  public min: number;
  public order: number;
  public setCallee: string;

  constructor(opts: IUnit) {
    const { unit, value, max, min, order, setCallee } = opts;

    this.unit = unit;
    this.value = value;
    this.max = max;
    this.min = min;
    this.order = order;
    this.setCallee = setCallee;
  }

  static instance(unit: unitType): Unit {
    return Unit.create(unit);
  }

  static create(unit: unitType): Unit {
    return Unit.getInstance(unit);
  }

  static getDayMax({ month, year }: {month: number; year: number}): number {
    return isLeap(year) ? leapLadder[month] : nonLeapLadder[month]
  }

  static getInstance(unit: unitType): Unit {
    if (!singletonInstance[unit]) {
      const defaultProps = {
        unit,
        order: units.indexOf(unit) + 1,
      };

      let props = null;

      switch (unit) {
        case 'milliSecond':
          props = {
            min: 0,
            max: 999,
            value: 1,
            setCallee: 'setMilliseconds',
          };
          break;
        case 'second':
          props = {
            min: 0,
            max: 59,
            value: 1 * unitBase,
            setCallee: 'setSeconds',
          };
          break;
        case 'minute':
          props = {
            min: 0,
            max: 59,
            value: 60 * unitBase,
            setCallee: 'setMinutes',
          };
          break;
        case 'hour':
          props = {
            min: 0,
            max: 23,
            value: 60 * 60 * unitBase,
            setCallee: 'setHours',
          };
          break;
        case 'day':
          props = {
            min: 0,
            max: Unit.getDayMax,
            value: 24 * 3600 * unitBase,
            setCallee: 'setDate',
          };
          break;
        case 'month':
          props = {
            min: 1,
            max: 12,
            value: undefined,
            setCallee: 'setMonth',
          };
          break;
        case 'weekday':
          props = {
            min: 1,
            max: 7,
            value: undefined,
            setCallee: undefined,
          };
          break;
      }

      singletonInstance[unit] = new Unit({
        ...props, ...defaultProps
      } as IUnit);
    }

    return singletonInstance[unit];
  }
}
