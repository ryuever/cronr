import Pattern from '../src/Pattern';
import { LITERAL, RANGE, EVERY } from '../src/tokenTypes';

test('works with specified second pattern', () => {
  const pattern = Pattern.create('2,4-9,3-7 0 0 0 0 0');
  const { secondToken } = pattern;

  const partsFromSecond = secondToken.formatToParts();
  expect(partsFromSecond).toEqual([
    { type: LITERAL, value: 2 },
    { type: RANGE, value: { from: 4, to: 9 } },
    { type: RANGE, value: { from: 3, to: 7 } },
  ]);
});

test('works with specified second and minute mixed pattern', () => {
  const pattern = Pattern.create('2,4-9,3-7 2-8,3-9 0 0 0 0');
  const { secondToken, minuteToken } = pattern;

  const partsFromSecond = secondToken.formatToParts();
  expect(partsFromSecond).toEqual([
    { type: LITERAL, value: 2 },
    { type: RANGE, value: { from: 4, to: 9 } },
    { type: RANGE, value: { from: 3, to: 7 } },
  ]);

  const partsFromMinute = minuteToken.formatToParts();
  expect(partsFromMinute).toEqual([
    { type: RANGE, value: { from: 2, to: 8 } },
    { type: RANGE, value: { from: 3, to: 9 } },
  ]);
});

test('with asterisk', () => {
  const pattern = Pattern.create('* * * * * *');
  const { secondToken, minuteToken } = pattern;
  const partsFromSecond = secondToken.formatToParts();
  expect(partsFromSecond).toEqual([{ type: EVERY, value: 1 }]);

  const partsFromMinute = minuteToken.formatToParts();
  expect(partsFromMinute).toEqual([{ type: EVERY, value: 1 }]);
});

test('with asterisk and slash', () => {
  const pattern = Pattern.create('*/3 * * * * *');
  const { secondToken } = pattern;
  const partsFromSecond = secondToken.formatToParts();
  expect(partsFromSecond).toEqual([{ type: EVERY, value: 3 }]);
});

test('number range and slash', () => {
  const pattern = Pattern.create('7-8/3 * * * * *');
  const { secondToken } = pattern;

  const partsFromSecond = secondToken.formatToParts();
  expect(partsFromSecond).toEqual([
    { type: EVERY, value: 3 },
    {
      type: RANGE,
      value: {
        from: 7,
        to: 8,
      },
    },
  ]);
});

test('For month token, it should be start from 0', () => {
  const pattern = Pattern.create('* * * * Jan *');
  const { monthToken } = pattern;
  const partsFromMonth = monthToken.formatToParts();
  expect(partsFromMonth).toEqual([{ type: LITERAL, value: 0 }]);
});

test('For month token, its max value should be 11', () => {
  const pattern = Pattern.create('* * * * Dec *');
  const { monthToken } = pattern;
  const partsFromMonth = monthToken.formatToParts();
  expect(partsFromMonth).toEqual([{ type: LITERAL, value: 11 }]);
});

test('If month pattern has number, it will minus 1 on parse', () => {
  const pattern = Pattern.create('* * * * 12 *');
  const { monthToken } = pattern;
  const partsFromMonth = monthToken.formatToParts();
  expect(partsFromMonth).toEqual([{ type: LITERAL, value: 11 }]);
});

test('For month token, its max value should be 11', () => {
  const pattern = Pattern.create('* * * * Dec *');
  const { monthToken } = pattern;
  const partsFromMonth = monthToken.formatToParts();
  expect(partsFromMonth).toEqual([{ type: LITERAL, value: 11 }]);
});

test('Test month range', () => {
  const pattern = Pattern.create('* * * * Jan-May *');
  const { monthToken } = pattern;
  const partsFromMonth = monthToken.formatToParts();
  expect(partsFromMonth).toEqual([
    {
      type: RANGE,
      value: {
        from: 0,
        to: 4,
      },
    },
  ]);
});

test('Test month with full name', () => {
  const pattern = Pattern.create('* * * * January *');
  const { monthToken } = pattern;
  const partsFromMonth = monthToken.formatToParts();
  expect(partsFromMonth).toEqual([
    {
      type: LITERAL,
      value: 0,
    },
  ]);
});

test('Test month mixin short name with full name', () => {
  const pattern = Pattern.create('* * * * Mar-December *');
  const { monthToken } = pattern;
  const partsFromMonth = monthToken.formatToParts();
  expect(partsFromMonth).toEqual([
    {
      type: RANGE,
      value: {
        from: 2,
        to: 11,
      },
    },
  ]);
});

test('Test weekday', () => {
  const pattern = Pattern.create('* * * * * Tue');
  const { weekdayToken } = pattern;
  const partsFromWeekday = weekdayToken.formatToParts();
  expect(partsFromWeekday).toEqual([{ type: LITERAL, value: 2 }]);
});

test('test weekday range', () => {
  const pattern = Pattern.create('* * * * * Mon-Sat');
  const { weekdayToken } = pattern;
  const partsFromWeekday = weekdayToken.formatToParts();
  expect(partsFromWeekday).toEqual([
    {
      type: RANGE,
      value: {
        from: 1,
        to: 6,
      },
    },
  ]);
});

test('test weekday min to max', () => {
  const pattern = Pattern.create('* * * * * Mon-Sun');
  const { weekdayToken } = pattern;
  const partsFromWeekday = weekdayToken.formatToParts();
  expect(partsFromWeekday).toEqual([
    {
      type: RANGE,
      value: {
        from: 1,
        to: 7,
      },
    },
  ]);
});

test('test weekday min to max with number from 0-6', () => {
  const pattern = Pattern.create('* * * * * 0-6');
  const { weekdayToken } = pattern;
  const partsFromWeekday = weekdayToken.formatToParts();
  expect(partsFromWeekday).toEqual([
    {
      type: RANGE,
      value: {
        from: 1,
        to: 7,
      },
    },
  ]);
});

test('test weekday min to max with number from 1-7', () => {
  const pattern = Pattern.create('* * * * * 1-7');
  const { weekdayToken } = pattern;

  const partsFromWeekday = weekdayToken.formatToParts();
  expect(partsFromWeekday).toEqual([
    {
      type: RANGE,
      value: {
        from: 1,
        to: 7,
      },
    },
  ]);
});

test('test weekday with full name', () => {
  const pattern = Pattern.create('* * * * * monday-sunday');
  const { weekdayToken } = pattern;

  const partsFromWeekday = weekdayToken.formatToParts();
  expect(partsFromWeekday).toEqual([
    {
      type: RANGE,
      value: {
        from: 1,
        to: 7,
      },
    },
  ]);
});

test('test weekday mixin short name with full name', () => {
  const pattern = Pattern.create('* * * * * monday-fri');
  const { weekdayToken } = pattern;
  const partsFromWeekday = weekdayToken.formatToParts();
  expect(partsFromWeekday).toEqual([
    {
      type: RANGE,
      value: {
        from: 1,
        to: 5,
      },
    },
  ]);
});
