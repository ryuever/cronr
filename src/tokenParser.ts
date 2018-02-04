import { LITERAL, RANGE, EVERY } from './types';
import Unit, { unitType, assignFn } from './Unit';

const isString = (str: any) => typeof str === 'string';
const isNumber = (obj: any) => typeof obj === 'number';
const isDefined = (str: any) => typeof str !== 'undefined';
const weekdayToNumber = (str:string):number => weekdays.indexOf(str);
const monthToNumber = (str: string):number => monthes.indexOf(str)
const toInt = (int: any) => parseInt(int);
const capitalizeFirst = (str: string): string => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1, 3);
const capitalizeAndSlice = (str: string) => str.replace(/[a-zA-Z]+/g, capitalizeFirst);

const weekdays = [,'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthes = [,
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function combinePatterns(patterns: Array<RegExp>) {
  return (str: string) => {
    for (let pattern of patterns) {
      const match = pattern.test(str);
      if (match) return extractors[pattern.source](str);
    }

    throw new Error(`no match patterns`);
  }
}

const conbineWithProceed = (processors: Array<Function>) =>(arr: any)=>
  processors.reduce((prev, cur) => cur(prev), arr);

const preProcess = Object.create(null);
preProcess.month = conbineWithProceed([capitalizeAndSlice])
preProcess.weekday = conbineWithProceed([capitalizeAndSlice])

const twoDigital = /^(\d{1,2})$/;
const threeDigital = /^(\d{1,2})$/;
const numberRange = /^(\d+)-(\d+)$/;
const asterisk = /^(\*)(?:\/([0-9]*))?$/;
const oneWithSlash = /^(\d{1,2})\/([0-9]*)$/;
const twoNumberWithSlash = /^(\d+)-(\d+)\/([0-9]*)$/;
const weekday = RegExp(`^(${weekdays.join('|')})(?:-(${weekdays.join('|')}))?$`);
const month = RegExp(`^(${monthes.join('|')})(?:-(${monthes.join('|')}))?$`);

const patterns = Object.create(null);
patterns.milliSecond = combinePatterns([threeDigital, numberRange, asterisk, twoNumberWithSlash]);
patterns.second = combinePatterns([twoDigital, numberRange, asterisk, twoNumberWithSlash]);
patterns.minute = combinePatterns([twoDigital, numberRange, asterisk, twoNumberWithSlash]);
patterns.hour = combinePatterns([twoDigital, numberRange, asterisk, twoNumberWithSlash]);
patterns.day = combinePatterns([twoDigital, numberRange, asterisk, twoNumberWithSlash]);
patterns.month = combinePatterns([twoDigital, numberRange, asterisk, twoNumberWithSlash, month]);
patterns.weekday = combinePatterns([twoDigital, numberRange, asterisk, twoNumberWithSlash, weekday]);

const extractors = Object.create(null);
const regToKey = (reg: RegExp): string => reg.source;

extractors[regToKey(twoDigital)] = (str: string) => {
  const result = twoDigital.exec(str);
  if (result) {
    const [, value ] = result;
    return {
      type: LITERAL,
      value: toInt(value),
    };
  }
  return null;
};

extractors[regToKey(threeDigital)] = (str: string) => {
  const result = threeDigital.exec(str);
  if (result) {
    const [, value ] = result;
    return {
      type: LITERAL,
      value: toInt(value),
    };
  }
  return null;
};

extractors[regToKey(numberRange)] = (str: string) => {
  const result = numberRange.exec(str);
  if (result) {
    const [, from, to ] = result;
    return {
      type: RANGE,
      value: {
        from: toInt(from),
        to: toInt(to),
      },
    };
  }
  return null;
};

extractors[regToKey(asterisk)] = (str: string) => {
  const result = asterisk.exec(str);
  if (result) {
    const [, , value] = result;
    if (value) return {
      type: EVERY,
      value: toInt(value)
    };
    return {
      type: EVERY,
      value: 1,
    };
  }
}

extractors[regToKey(oneWithSlash)] = (str: string) => {
  const result = oneWithSlash.exec(str);
  if (result) {
    const [, from, value] = result;
    return [
      { type: EVERY, value: toInt(value) },
      { type: RANGE, value: {
        from: toInt(from),
      }}
    ]
  }
}

extractors[regToKey(twoNumberWithSlash)] = (str: string) => {
  const result = twoNumberWithSlash.exec(str);
  if (result) {
    const [, from, to, value] = result;
    return [
      { type: EVERY, value: toInt(value) },
      { type: RANGE,
        value: {
          from: toInt(from),
          to: toInt(to),
        }
      }
    ];
  }

  return [];
}

extractors[regToKey(weekday)] = (str: string) => {
  const nextStr  = capitalizeAndSlice(str);
  const result = weekday.exec(nextStr);
  if (result) {
    const [, from, to] = result;

    if (to) return {
      type: RANGE,
      value: {
        from: weekdayToNumber(from),
        to: weekdayToNumber(to),
      }
    }
    return {
      type: LITERAL, value: weekdayToNumber(from),
    };
  }
}

extractors[regToKey(month)] = (str: string) => {
  const nextStr  = capitalizeAndSlice(str);
  const result = month.exec(nextStr);
  if (result) {
    const [, from, to] = result;

    if (to) return {
      type: RANGE,
      value: {
        from: monthToNumber(from),
        to: monthToNumber(to),
      }
    }
    return {
      type: LITERAL,
      value: monthToNumber(from),
    };
  }
}

type numberValue = number;
type rangeValue = {
  from?: number,
  to?: number | assignFn,
}
export type ILiteral = { type: 'literal', value: numberValue };
export type IEvery = { type: 'every', value: numberValue };
export type IRange = { type: 'range', value: rangeValue};

export type parseResult = ILiteral | IEvery | IRange;

export type IParse = Array<parseResult>;

type postFn = (arr: IParse) => IParse;

// const conbineWithProceed = (processors: Array<postFn>): postFn =>
//   (arr: IParse) => processors.reduce((prev, cur) => cur(prev), arr);

const normalizeValue = (max: number, min: number, value: numberValue): numberValue => {
  if (value > max) return max;
  if (value < min) return min;
  return value;
};

const normalizeRangeValue = (max: number, min: number, value: rangeValue): rangeValue => {
  const { from, to } = value;

  const nextFrom = normalizeValue(max, min, <number>from);
  const nextTo = normalizeValue(max, min, <number>to);

  return {
    from: nextFrom,
    to: nextTo,
  };
};

// declare interface ObjectConstructor {
//   assign(target: any, ...sources: any[]): any;
// }

const runValueRangeConstraint = (unit: unitType) => {
  return (actions: IParse): IParse => {

    const instance: Unit = Unit.getInstance(unit);
    const { max, min } = instance;

    if (isNumber(max) && isNumber(min)) {
      const nextMax: number = <number>max;
      const nextMin: number = <number>min;
      return actions.map((action: parseResult):parseResult => {
        const { type, value } = action;

        switch(type) {
          case LITERAL:
            // return { ...action, value: normalizeValue(nextMax, min, <numberValue>value))};
            return Object.assign({}, action, {
              value: normalizeValue(nextMax, nextMin, <numberValue>value)
            });
          case RANGE:
            return Object.assign({}, action, {
              value: normalizeRangeValue(nextMax, nextMin, <rangeValue>value)
            });
          case EVERY:
            return { ...action };
        }
      })
    }

    return actions;
  }
}

const normalizeWeekdayValue = (actions: IParse): IParse => {
  const instance: Unit = Unit.getInstance('weekday');
  const { max, min } = instance;
  return actions.map((action) => {
    const { type, value } = action;
    switch(type) {
      case LITERAL:
        // return { ...action, value: value === 0 ? 7 : value }
        return Object.assign({}, action, {
          value: value === 0 ? 7 : value,
        })
      case RANGE:
        if ((<rangeValue>value).from === 0 && (<rangeValue>value).to === 6) {
          // return { ...action, value: { from: 1, to: 7 }};
          return Object.assign({}, action, {
            value: { from: 1, to: 7 }
          })
        }
        return action;
      case EVERY:
        return action;
    }
  })
}

const postProcess = Object.create(null);
postProcess.milliSecond = conbineWithProceed([runValueRangeConstraint('milliSecond')]);
postProcess.second = conbineWithProceed([runValueRangeConstraint('second')]);
postProcess.minute = conbineWithProceed([runValueRangeConstraint('minute')]);
postProcess.hour = conbineWithProceed([runValueRangeConstraint('hour')]);
postProcess.month = conbineWithProceed([runValueRangeConstraint('month')]);
// normalizeWeekdayValue` should run first. It should process origin value with `0-6`
postProcess.weekday = conbineWithProceed([normalizeWeekdayValue, runValueRangeConstraint('weekday')]);

export function parse(string: string, unit: unitType): IParse {
  const arr = string.split(',');

  return arr.reduce((mergedValue, cur) => {
    const pattern = patterns[unit];
    let nextCur = cur;

    if (preProcess[unit]) {
      nextCur = preProcess[unit](cur);
    }

    let result = pattern(nextCur);

    if (postProcess[unit]) {
      result = postProcess[unit]([].concat(result));
    }

    return mergedValue.concat(result);
  }, []);
}
