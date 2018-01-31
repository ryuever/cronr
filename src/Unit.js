import utils from './utils';
const { isLeap } = utils;

export const units = [
  'second',
  'minute',
  'hour',
  'day',
  'month',
  'weekday'
];

let singletonSecond = null;
let singletonMinute = null;
let singletonHour = null;
let singletonDay = null;
let singletonMonth = null;
let singletonWeekday = null;

const unitBase = 1000;

const nonLeapLadder = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  leapLadder = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export default class Unit {
  constructor(opts) {
    const { unit, value, max, min, order } = opts;

    this.unit = unit;
    this.value = value;
    this.max = max;
    this.min = min;
    this.order = order;
  }

  static instance(unit) {
    return Unit.create(unit);
  }

  static create(unit) {
    switch(unit) {
      case 'milliSecond':
        return Unit.milliSecondInstance;
      case 'second':
        return Unit.secondInstance;
      case 'minute':
        return Unit.minuteInstance;
      case 'hour':
        return Unit.hourInstance;
      case 'day':
        return Unit.dayInstance;
      case 'month':
        return Unit.monthInstance;
      case 'weekday':
        return Unit.weekdayInstance;
    }
  }

  static get milliSecondInstance() {
    if (!singletonMilliSecond) {
      singletonMilliSecond = new Unit({
        unit: 'milliSecond',
        value: 1,
        order: 1,
        setCallee: 'setMilliSeconds',
        min: 0,
        max: 999,
      });
    }
    return singletonMilliSecond;
  }

  static get secondInstance() {
    if (!singletonSecond) {
      singletonSecond = new Unit({
        unit: 'second',
        value: 1 * unitBase,
        order: 2,
        setCallee: 'setSeconds',
        min: 0,
        max: 59,
      });
    }
    return singletonSecond;
  }

  static get minuteInstance() {
    if (!singletonMinute) {
      singletonMinute = new Unit({
        unit: 'minute',
        value: 60 * unitBase,
        order: 3,
        setCallee: 'setMinutes',
        min: 0,
        max: 59,
      });
    }
    return singletonMinute;
  }

  static get hourInstance() {
    if (!singletonHour) {
      singletonHour = new Unit({
        unit: 'hour',
        value: 60 * 60 * unitBase,
        order: 4,
        setCallee: 'setHours',
        min: 0,
        max: 23,
      });
    }
    return singletonHour;
  }

  static get dayInstance() {
    if (!singletonDay) {
      singletonDay = new Unit({
        unit: 'day',
        value: 24 * 3600 * unitBase,
        order: 5,
        setCallee: 'setDate',
        min: 0,
        max: ({ month, year }) => isLeap(year) ? leapLadder[month] : nonLeapLadder[month],
      });
    }
    return singletonDay;
  }

  static get monthInstance() {
    if (!singletonMonth) {
      singletonMonth = new Unit({
        unit: 'month',
        value: 60 * unitBase,
        order: 6,
        setCallee: 'setMonth',
        min: 0,
        max: 11,
      });
    }
    return singletonMonth;
  }

  static get weekdayInstance() {
    if (!singletonWeekday) {
      singletonWeekday = new Unit({
        unit: 'weekday',
        value: 60 * unitBase,
        min: 0,
        max: 6,
      });
    }
    return singletonWeekday;
  }
}
