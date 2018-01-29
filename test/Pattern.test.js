import Pattern from '../src/Pattern';

test('works with specified second pattern', () => {
  const pattern = Pattern.create('2,4-9,3-7 0 0 0 0 0');
  const {
    secondToken,
    minuteToken,
    hourToken,
    dayToken,
    monthToken,
    weekdayToken
  } = pattern;

  const partsFromSecond = secondToken.formatToParts();
  expect(partsFromSecond).toEqual([
    { type: 'literal', value: 2 },
    { type: 'from', value: 4 },
    { type: 'to', value: 7 }
  ]);
})

test('works with specified second and minute mixed pattern', () => {
  const pattern = Pattern.create('2,4-9,3-7 2-8,3-9 0 0 0 0');
  const {
    secondToken,
    minuteToken,
    hourToken,
    dayToken,
    monthToken,
    weekdayToken
  } = pattern;

  const partsFromSecond = secondToken.formatToParts();
  expect(partsFromSecond).toEqual([
    { type: 'literal', value: 2 },
    { type: 'from', value: 4 },
    { type: 'to', value: 7 }
  ]);

  const partsFromMinute = minuteToken.formatToParts();
  expect(partsFromMinute).toEqual([
    { type: 'from', value: 3 },
    { type: 'to', value: 8 }
  ]);
})

test('with asterisk', () => {
  const pattern = Pattern.create('* * * * * *');
  const {
    secondToken,
    minuteToken,
    hourToken,
    dayToken,
    monthToken,
    weekdayToken
  } = pattern;

  const partsFromSecond = secondToken.formatToParts();
  expect(partsFromSecond).toEqual([
    { type: 'every', value: 1 },
  ]);

  const partsFromMinute = minuteToken.formatToParts();
  expect(partsFromMinute).toEqual([
    { type: 'every', value: 1 },
  ]);
})

test('with asterisk and slash', () => {
  const pattern = Pattern.create('*/3 * * * * *');
  const {
    secondToken,
    minuteToken,
    hourToken,
    dayToken,
    monthToken,
    weekdayToken
  } = pattern;

  const partsFromSecond = secondToken.formatToParts();
  expect(partsFromSecond).toEqual([
    { type: 'every', value: 3 },
  ]);
})

test('number range and slash', () => {
  const pattern = Pattern.create('7-8/3 * * * * *');
  const {
    secondToken,
    minuteToken,
    hourToken,
    dayToken,
    monthToken,
    weekdayToken
  } = pattern;

  const partsFromSecond = secondToken.formatToParts();
  expect(partsFromSecond).toEqual([
    { type: 'every', value: 3 },
    { type: 'from', value: 7 },
    { type: 'to', value: 8 },
  ]);
})

test('test month', () => {
  const pattern = Pattern.create('* * * * Jan *');
  const {
    secondToken,
    minuteToken,
    hourToken,
    dayToken,
    monthToken,
    weekdayToken
  } = pattern;

  const partsFromMonth = monthToken.formatToParts();
  expect(partsFromMonth).toEqual([
    { type: 'literal', value: 0 },
  ]);
})

test('test month range', () => {
  const pattern = Pattern.create('* * * * Jan-May *');
  const {
    secondToken,
    minuteToken,
    hourToken,
    dayToken,
    monthToken,
    weekdayToken
  } = pattern;

  const partsFromMonth = monthToken.formatToParts();
  expect(partsFromMonth).toEqual([
    { type: 'from', value: 0 },
    { type: 'to', value: 4 },
  ]);
})

test('test weekday', () => {
  const pattern = Pattern.create('* * * * * Tue');
  const {
    secondToken,
    minuteToken,
    hourToken,
    dayToken,
    monthToken,
    weekdayToken
  } = pattern;

  const partsFromWeekday = weekdayToken.formatToParts();
  expect(partsFromWeekday).toEqual([
    { type: 'literal', value: 1 },
  ]);
})

test('test weekday range', () => {
  const pattern = Pattern.create('* * * * * Mon-Sat');
  const {
    secondToken,
    minuteToken,
    hourToken,
    dayToken,
    monthToken,
    weekdayToken
  } = pattern;

  const partsFromWeekday = weekdayToken.formatToParts();
  expect(partsFromWeekday).toEqual([
    { type: 'from', value: 0 },
    { type: 'to', value: 5 },
  ]);
})
