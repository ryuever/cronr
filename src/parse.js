const isString = (str) => typeof str === 'string';
const isPresent = (str) => typeof str !== 'undefined';

const twoDigital = /^(\d{1,2})$/;
const numberRange = /^(\d+)-(\d+)$/;
const weekday = /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/;
const month = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/;

const patterns = Object.create(null);
patterns.sec = combinePatterns([twoDigital, numberRange]);
patterns.min = combinePatterns([twoDigital, numberRange]);
patterns.hour = combinePatterns([twoDigital, numberRange]);
patterns.day = combinePatterns([twoDigital, numberRange]);
patterns.month = combinePatterns([twoDigital, numberRange]);
patterns.weekday = combinePatterns([twoDigital, numberRange]);

const toGetPatternByIndex = (index) => {
  switch(index) {
    case 0:
      return 'sec';
    case 1:
      return 'min';
    case 2:
      return 'hour';
    case 3:
      return 'day';
    case 4:
      return 'month';
    case 5:
      return 'weekday';
  }
}

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
extractors[twoDigital] = (str) => {
  const [, value ] = twoDigital.exec(str);
  return {
    value: parseInt(value),
  };
};
extractors[numberRange] = (str) => {
  const [, from, to ] = numberRange.exec(str);
  return {
    from: parseInt(from),
    to: parseInt(to),
  };
};

function parseOne(string, pattern) {
  const arr = string.split(',');

  return arr.reduce((prev, cur) => {
    const result = pattern(cur);
    const { from, to, value } = result;

    prev.from = !isPresent(from) ? prev.from : !isPresent(prev.from) ? from : from > prev.from ? from : prev.from || 0;
    prev.to = !isPresent(to) ? prev.to : !isPresent(prev.to) ? to : to < prev.to ? to : prev.to;
    prev.values = !isPresent(value) ? prev.values : prev.values.concat(value);

    return prev;
  }, {
    from: undefined,
    to: undefined,
    values: [],
  })
}

export default function parse(str) {
  let result = Object.create(null);

  const bases = str.split(' ');

  bases.reduce((_, cur, index) => {
    const key = toGetPatternByIndex(index);
    const ret = parseOne(cur, patterns[key]);
    result[key] = ret;
  }, {})

  return result;
}
