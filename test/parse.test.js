import parse from '../src/parse';

test('parse second', () => {
  const result = parse('2 0 0 0 0 0');
  const sec = result.sec;

  expect(sec).toEqual({
    from: undefined,
    to: undefined,
    values: [2],
  })
})

test('parse second with number range', () => {
  const result = parse('2,4-9 0 0 0 0 0');
  const sec = result.sec;

  expect(sec).toEqual({
    from: 4,
    to: 9,
    values: [2],
  })
})

test('parse second with mixed number range', () => {
  const result = parse('2,4-9,3-7 0 0 0 0 0');
  const sec = result.sec;

  expect(sec).toEqual({
    from: 4,
    to: 7,
    values: [2],
  })
})

test('parse minute', () => {
  const result = parse('2 3 0 0 0 0');
  const min = result.min;

  expect(min).toEqual({
    from: undefined,
    to: undefined,
    values: [3],
  })
})

test('parse minute with number range', () => {
  const result = parse('2,4-9 2-8 0 0 0 0');
  const min = result.min;

  expect(min).toEqual({
    from: 2,
    to: 8,
    values: [],
  })
})

test('parse minute with mixed number range', () => {
  const result = parse('2,4-9,3-7 2-8,3-9 0 0 0 0');
  const min = result.min;

  expect(min).toEqual({
    from: 3,
    to: 8,
    values: [],
  })
})
