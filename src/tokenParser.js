const isString = (str) => typeof str === 'string';
const isDefined = (str) => typeof str !== 'undefined';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthes = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const twoDigital = /^(\d{1,2})$/;
const numberRange = /^(\d+)-(\d+)$/;
const asterisk = /^(\*)(?:\/([0-9]*))?$/;
const oneWithSlash = /^(\d{1,2})\/([0-9]*)$/;
const twoNumberWithSlash = /^(\d+)-(\d+)\/([0-9]*)$/;
const weekday = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:-(Mon|Tue|Wed|Thu|Fri|Sat|Sun))?$/;
const month = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))?/;

const weekdayToNumber = str => weekdays.indexOf(str);
const monthToNumber = str => monthes.indexOf(str)

const patterns = Object.create(null);
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

extractors[twoDigital] = (str) => {
  const result = twoDigital.exec(str);
  if (result) {
    const [, value ] = result;
    return {
      literal: parseInt(value),
    };
  }
  return null;
};

extractors[numberRange] = (str) => {
  const result = numberRange.exec(str);
  if (result) {
    const [, from, to ] = result;
    return {
      from: parseInt(from),
      to: parseInt(to),
    };
  }
  return null;
};

extractors[asterisk] = (str) => {
  const result = asterisk.exec(str);
  if (result) {
    const [, , value] = result;
    // if (value) return { type: 'every', value: value };
    // return { type: 'every', value: '1' };
    if (value) return {
      every: parseInt(value)
    };
    return { every: 1 };
  }
}

extractors[oneWithSlash] = (str) => {
  const result = oneWithSlash.exec(str);
  if (result) {
    const [, from, value] = result;
    // return { type: 'every', value: '1' };
    return {
      every: parseInt(value),
      from: parseInt(from)
    }
  }
}

extractors[twoNumberWithSlash] = (str) => {
  const result = twoNumberWithSlash.exec(str);
  if (result) {
    const [,from , to, value] = result;
    return {
      every: parseInt(value),
      from: parseInt(from),
      to: parseInt(to),
    };
  }
}

extractors[weekday] = (str) => {
  const result = weekday.exec(str);
  if (result) {
    const [, from, to, value] = result;

    if (to) return {
      from: weekdayToNumber(from),
      to: weekdayToNumber(to),
    }
    return {
      literal: weekdayToNumber(from),
    };
  }
}

extractors[month] = (str) => {
  const result = month.exec(str);
  if (result) {
    const [, from, to, value] = result;
    if (to) return {
      from: monthToNumber(from),
      to: monthToNumber(to),
    }
    return {
      literal: monthToNumber(from),
    };
  }
}

function normalize(items) {
  const literals = [];
  let from = null;
  let to = null;

  items.forEach((item) => {
    const { type, value } = item;

    if (type === 'literal') literals.push(item);
    if (type === 'every') literals.push(item);

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
    const { from, to, literal, every } = result;

    isDefined(from) && mergedValue.push({
      type: 'from', value: from,
    })

    isDefined(to) && mergedValue.push({
      type: 'to', value: to,
    })

    isDefined(literal) && mergedValue.push({
      type: 'literal', value: literal,
    })

    isDefined(every) && mergedValue.push({
      type: 'every', value: every,
    })

    return mergedValue;
  }, []);

  return normalize(draftValues);
}
