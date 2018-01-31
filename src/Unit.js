import utils from './utils';
const { isLeap } = utils;

export const units = [
  'milliSecond',
  'second',
  'minute',
  'hour',
  'day',
  'month',
  'weekday'
];

const nonLeapLadder = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const leapLadder = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
let singletonInstance = Object.create(null);
const unitBase = 1000;

export default class Unit {
  constructor(opts) {
    const { unit, value, max, min, order, setCallee } = opts;

    this.unit = unit;
    this.value = value;
    this.max = max;
    this.min = min;
    this.order = order;
    this.setCallee = setCallee;
  }

  static instance(unit) {
    return Unit.create(unit);
  }

  static create(unit) {
    return Unit.getInstance(unit);
  }

  static getInstance(unit) {
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
            max: ({ month, year }) => isLeap(year) ? leapLadder[month] : nonLeapLadder[month],
            value: 24 * 3600 * unitBase,
            setCallee: 'setDate',
          };
          break;
        case 'month':
          props = {
            min: 0,
            max: 11,
            value: undefined,
            setCallee: 'setMonth',
          };
        case 'weekday':
          props = {
            min: 0,
            max: 6,
            value: undefined,
            setCallee: undefined,
          };
          break;
      }

      singletonInstance[unit] = new Unit({
        ...props, ...defaultProps
      })
    }

    return singletonInstance[unit];
  }
}
