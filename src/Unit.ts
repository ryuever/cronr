import utils from "./utils";
const { isLeap } = utils;

export const units: unitTypes = [
  "milliSecond",
  "second",
  "minute",
  "hour",
  "day",
  "month",
  "weekday"
];

export type timeType = "milliSecond" | "second" | "minute" | "hour";
export type dateType = "day" | "month" | "weekday";
export type unitType = timeType | dateType;
export type unitTypes = Array<unitType>;
export type timeTypes = Array<timeType>;
export type dateTypes = Array<dateType>;

const nonLeapLadder = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const leapLadder = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
let singletonInstance = Object.create(null);
const unitBase = 1000;

export type assignFn = (
  opt: {
    month?: number;
    year?: number;
  }
) => number;

export interface IUnit {
  unit: unitType;
  value: number;
  max: number | assignFn;
  min: number;
  order: number;
  step: number;
  setCallee: string;
  affiliatedMax?: assignFn;
}

export default class Unit {
  public unit: unitType;
  public value: number;
  public max: number | assignFn;
  public min: number;
  public order: number;
  public step: number;
  public setCallee: string;
  public affiliatedMax?: assignFn;

  constructor(opts: IUnit) {
    const {
      unit,
      value,
      step,
      max,
      min,
      order,
      setCallee,
      affiliatedMax
    } = opts;

    this.unit = unit;
    this.value = value;
    this.max = max;
    this.min = min;
    this.order = order;
    this.step = step;
    this.setCallee = setCallee;
    this.affiliatedMax = affiliatedMax;
  }

  static instance(unit: unitType): Unit {
    return Unit.create(unit);
  }

  static create(unit: unitType): Unit {
    return Unit.getInstance(unit);
  }

  static getDayMax({ month, year }: { month: number; year: number }): number {
    return isLeap(year) ? leapLadder[month] : nonLeapLadder[month];
  }

  static getInstance(unit: unitType): Unit {
    if (!singletonInstance[unit]) {
      const defaultProps = {
        unit,
        order: units.indexOf(unit) + 1
      };

      let props: any = undefined;

      switch (unit) {
        case "milliSecond":
          props = {
            min: 0,
            max: 999,
            step: 1,
            value: 1,
            setCallee: "setMilliseconds"
          };
          break;
        case "second":
          props = {
            min: 0,
            max: 59,
            step: 1 * unitBase,
            value: 1 * unitBase,
            setCallee: "setSeconds"
          };
          break;
        case "minute":
          props = {
            min: 0,
            max: 59,
            step: 60 * unitBase,
            value: 60 * unitBase,
            setCallee: "setMinutes"
          };
          break;
        case "hour":
          props = {
            min: 0,
            max: 23,
            step: 60 * 60 * unitBase,
            value: 60 * 60 * unitBase,
            setCallee: "setHours"
          };
          break;
        case "day":
          props = {
            min: 1,
            max: Unit.getDayMax,
            step: 24 * 3600 * unitBase,
            value: 24 * 3600 * unitBase,
            setCallee: "setDate"
          };
          break;
        case "weekday":
          props = {
            min: 1,
            max: 7,
            affiliatedMax: Unit.getDayMax,
            step: 24 * 3600 * unitBase,
            value: undefined,
            setCallee: "setDate"
          };
          break;
        case "month":
          props = {
            min: 0,
            max: 11,
            step: 24 * 3600 * unitBase,
            value: undefined,
            setCallee: "setMonth"
          };
          break;
      }

      singletonInstance[unit] = new Unit(Object.assign(
        {},
        props,
        defaultProps
      ) as IUnit);
      // } as IUnit);
    }

    return singletonInstance[unit];
  }
}
