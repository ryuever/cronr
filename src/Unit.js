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

const unitBase = 1;

export default class Unit {
  constructor(unit, value) {
    this.unit = unit;
    this.value = value;
  }

  static instance(unit) {
    return Unit.create(unit);
  }

  static create(unit) {
    switch(unit) {
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

  static get secondInstance() {
    if (!singletonSecond) {
      singletonSecond = new Unit({
        unit: 'second',
        value: 1 * unitBase,
      });
    }
    return singletonSecond;
  }

  static get minuteInstance() {
    if (!singletonMinute) {
      singletonMinute = new Unit({
        unit: 'minute',
        value: 60 * unitBase,
      });
    }
    return singletonMinute;
  }

  static get hourInstance() {
    if (!singletonHour) {
      singletonHour = new Unit({
        unit: 'hour',
        value: 60 * 60 * unitBase,
      });
    }
    return singletonHour;
  }

  static get dayInstance() {
    if (!singletonDay) {
      singletonDay = new Unit({
        unit: 'day',
        value: 60 * 3600 * unitBase,
      });
    }
    return singletonDay;
  }

  static get monthInstance() {
    if (!singletonMonth) {
      singletonMonth = new Unit({
        unit: 'month',
        value: 60 * unitBase,
      });
    }
    return singletonMonth;
  }

  static get weekdayInstance() {
    if (!singletonWeekday) {
      singletonWeekday = new Unit({
        unit: 'weekday',
        value: 60 * unitBase,
      });
    }
    return singletonWeekday;
  }
}
