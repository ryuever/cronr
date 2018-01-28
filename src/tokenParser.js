const isString = (str) => typeof str === 'string';
const isDefined = (str) => typeof str !== 'undefined';

const twoDigital = /^(\d{1,2})$/;
const numberRange = /^(\d+)-(\d+)$/;
const weekday = /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/;
const month = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/;

const patterns = Object.create(null);
patterns.second = combinePatterns([twoDigital, numberRange]);
patterns.minute = combinePatterns([twoDigital, numberRange]);
patterns.hour = combinePatterns([twoDigital, numberRange]);
patterns.day = combinePatterns([twoDigital, numberRange]);
patterns.month = combinePatterns([twoDigital, numberRange]);
patterns.weekday = combinePatterns([twoDigital, numberRange]);

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
    literal: parseInt(value),
  };
};
extractors[numberRange] = (str) => {
  const [, from, to ] = numberRange.exec(str);
  return {
    from: parseInt(from),
    to: parseInt(to),
  };
};

function normalize(items) {
  const literals = [];
  let from = null;
  let to = null;

  items.forEach((item) => {
    const { type, value } = item;

    if (type === 'literal') literals.push(item);

    if (type === 'from') {
      from ? from.value < value ? from = item : null : from = item;
    }

    if (type === 'to') {
      to ? to.value > value ? to = item : null : to = item;
    }
  })

  if (from && to && from.value > to.value) {
    throw new Error('invalid time range');
  }

  if (from && to && from.value === to.value) {
    literals.push({ type: 'literal', value: from.value });
    from = null;
    to = null;
  }

  return [literals, from, to].reduce((prev, cur) => {
    if (cur) return prev.concat(cur);
    return prev;
  }, [])
}

export function parse(string, unit) {
  const arr = string.split(',');

  const draftValues = arr.reduce((mergedValue, cur) => {
    const pattern = patterns[unit];
    const result = pattern(cur);
    const { from, to, literal } = result;

    isDefined(from) && mergedValue.push({
      type: 'from', value: from,
    })

    isDefined(to) && mergedValue.push({
      type: 'to', value: to,
    })

    isDefined(literal) && mergedValue.push({
      type: 'literal', value: literal,
    })

    return mergedValue;
  }, []);

  return normalize(draftValues);
}
