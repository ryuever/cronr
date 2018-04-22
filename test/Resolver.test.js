import Cronr from '../src/Cronr';
const noop = () => {};
const format = ts => ts.toLocaleString('en-US');

test('normalizeTsValueAfterUnit, all the item after specified unit will be set to a valid min value', () => {
  const ts = new Date(2018, 7, 22, 10, 23, 16);

  const cronrer = new Cronr({
    name: 'normalizeTsValueAfterUnit',
    pattern: '2,15-50 * * 3-12 3 *',
    ts,
  });

  cronrer.resolver.normalizeTsValueAfterUnit('day', ts);
  expect(format(ts)).toBe('8/22/2018, 12:00:00 AM');
});

test('normalizeTsValueAfterUnit for day, min value will be 1', () => {
  const ts = new Date(2018, 7, 22, 10, 23, 16);

  const cronrer = new Cronr({
    name: 'normalizeTsValueAfterUnit',
    pattern: '2,15-50 * * 3-12 3 *',
    ts,
  });

  cronrer.resolver.normalizeTsValueAfterUnit('month', ts);
  expect(format(ts)).toBe('8/1/2018, 12:00:00 AM');
});

test('normalizeTsValueAfterUnit with truthy `inclusive`', () => {
  const ts = new Date(2018, 7, 22, 10, 23, 16);

  const cronrer = new Cronr({
    name: 'normalizeTsValueAfterUnit',
    pattern: '2,15-50 * * 3-12 3 *',
    ts,
  });

  cronrer.resolver.normalizeTsValueAfterUnit('month', ts, true);
  expect(format(ts)).toBe('1/1/2018, 12:00:00 AM');
});

test('decorateTsWithClosestValidValueAfterUnit', () => {
  const ts = new Date(2018, 7, 22, 10, 23, 13);

  const cronrer = new Cronr({
    name: 'normalizeTsValueAfterUnit',
    pattern: '2,15-50 * * 3-12 3 *',
    ts,
  });

  cronrer.resolver.decorateTsWithClosestValidValueAfterUnit('day', ts);
  expect(format(ts)).toBe('8/22/2018, 10:23:15 AM');
});

test('decorateTsWithClosestValidValueAfterUnit', () => {
  expect(() => {
    const ts = new Date(2018, 7, 22, 10, 23, 13);

    const cronrer = new Cronr({
      name: 'normalizeTsValueAfterUnit',
      pattern: '2,15-50 * * 3-12 3 *',
      ts,
    });

    cronrer.resolver.decorateTsWithClosestValidValueAfterUnit('day', ts, true);
  }).toThrow();
});

test.only('check result', () => {
  const cronrer = new Cronr({
    name: 'testing',
    pattern: '2,5 * * 3-12 3 *',
    ts: new Date(2018, 7, 22, 10, 23, 16),
  });

  const data = cronrer.result;
  const result = data.next().value;
  expect(format(result)).toBe('3/3/2019, 12:00:02 AM');

  const result2 = data.next().value;
  expect(format(result2)).toBe('3/3/2019, 12:00:05 AM');
});

test('check result with iterator', () => {
  const cronrer = new Cronr({
    name: 'testing',
    pattern: '2,5-11 * * 3-12 8 *',
    ts: new Date(2018, 7, 22, 10, 23, 16),
  });

  const data = cronrer.result;
  const result = data.next().value;
  expect(format(result)).toBe('8/3/2018, 12:00:02 AM');

  const result2 = data.next().value;
  expect(format(result2)).toBe('8/3/2018, 12:00:05 AM');

  const result3 = data.next().value;
  expect(format(result3)).toBe('8/3/2018, 12:00:06 AM');
});
