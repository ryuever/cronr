import { LITERAL, RANGE, EVERY } from './types';
import { unitType, assignFn } from './Unit';

const isString = (str: any) => typeof str === 'string';
const isDefined = (str: any) => typeof str !== 'undefined';
const weekdayToNumber = (str:string):number => weekdays.indexOf(str);
const monthToNumber = (str: string):number => monthes.indexOf(str)
const toInt = (int: any) => parseInt(int);

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthes = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

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

function combinePatterns(patterns) {
  return (str) => {
    for (let pattern of patterns) {
      const match = pattern.test(str);
      if (match) return extractors[pattern](str);
    }

    throw new Error(`no match patterns`);
  }
}

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
  const result = weekday.exec(str);
  if (result) {
    const [, from, to, value] = result;

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
  const result = month.exec(str);
  if (result) {
    const [, from, to, value] = result;
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

export type ILiteral = { type: 'literal', value: number };
export type IEvery = { type: 'every', value: number };
export type IRange = { type: 'range', value: {
  from?: number,
  to?: number | assignFn,
}}

export type parseResult = ILiteral | IEvery | IRange;

export type IParse = Array<parseResult>;

export function parse(string: string, unit: unitType): IParse {
  const arr = string.split(',');

  return arr.reduce((mergedValue, cur) => {
    const pattern = patterns[unit];
    const result = pattern(cur);

    return mergedValue.concat(result);
  }, []);
}
