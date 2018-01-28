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
