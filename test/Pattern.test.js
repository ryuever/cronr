import Pattern from '../src/Pattern';
import { LITERAL, RANGE, EVERY } from '../src/types';

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
    { type: LITERAL, value: 2 },
    { type: RANGE,
      value: {
        from: 4,
        to: 9,
    }},
    { type: RANGE,
      value: {
        from: 3,
        to: 7,
    }}
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
    { type: LITERAL, value: 2 },
    { type: RANGE,
      value: {
        from: 4,
        to: 9,
    }},
    { type: RANGE,
      value: {
        from: 3,
        to: 7,
    }}
  ]);

  const partsFromMinute = minuteToken.formatToParts();
  expect(partsFromMinute).toEqual([{
    type: RANGE,
    value: {
      from: 2,
      to: 8,
  }},{
    type: RANGE,
    value: {
      from: 3,
      to: 9,
    }}
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
    { type: EVERY, value: 1 },
  ]);

  const partsFromMinute = minuteToken.formatToParts();
  expect(partsFromMinute).toEqual([
    { type: EVERY, value: 1 },
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
    { type: EVERY, value: 3 },
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
    { type: EVERY, value: 3 },
    { type: RANGE,
      value: {
        from: 7,
        to: 8,
      }
    }
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
    { type: LITERAL, value: 0 },
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
  expect(partsFromMonth).toEqual([{
    type: RANGE,
    value: {
      from: 0,
      to: 4
    }
  }]);
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
    { type: LITERAL, value: 1 },
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
  expect(partsFromWeekday).toEqual([{
    type: RANGE,
    value: {
      from: 0,
      to: 5,
    }
  }]);
})
