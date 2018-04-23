import CronrCounter from '../src/CronrCounter';
import noop from './utils/noop';
import format from './utils/format';

test('normalizeTsValueAfterUnit, all the item after specified unit will be set to a valid min value', () => {
  const ts = new Date(2018, 7, 22, 10, 23, 16);

  const counter = new CronrCounter({
    name: 'normalizeTsValueAfterUnit',
    pattern: '2,15-50 * * 3-12 3 *',
    ts,
  });

  counter.resolver.normalizeTsValueAfterUnit('day', ts);
  expect(format(ts)).toBe('8/22/2018, 12:00:00 AM');
});

test('normalizeTsValueAfterUnit for day, min value will be 1', () => {
  const ts = new Date(2018, 7, 22, 10, 23, 16);

  const counter = new CronrCounter({
    name: 'normalizeTsValueAfterUnit',
    pattern: '2,15-50 * * 3-12 3 *',
    ts,
  });

  counter.resolver.normalizeTsValueAfterUnit('month', ts);
  expect(format(ts)).toBe('8/1/2018, 12:00:00 AM');
});

test('normalizeTsValueAfterUnit with truthy `inclusive`', () => {
  const ts = new Date(2018, 7, 22, 10, 23, 16);

  const counter = new CronrCounter({
    name: 'normalizeTsValueAfterUnit',
    pattern: '2,15-50 * * 3-12 3 *',
    ts,
  });

  counter.resolver.normalizeTsValueAfterUnit('month', ts, true);
  expect(format(ts)).toBe('1/1/2018, 12:00:00 AM');
});

test('decorateTsWithClosestValidValueAfterUnit', () => {
  const ts = new Date(2018, 7, 22, 10, 23, 13);

  const counter = new CronrCounter({
    name: 'normalizeTsValueAfterUnit',
    pattern: '2,15-50 * * 3-12 3 *',
    ts,
  });

  counter.resolver.decorateTsWithClosestValidValueAfterUnit('day', ts);
  expect(format(ts)).toBe('8/22/2018, 10:23:15 AM');
});

test('decorateTsWithClosestValidValueAfterUnit', () => {
  expect(() => {
    const ts = new Date(2018, 7, 22, 10, 23, 13);

    const counter = new CronrCounter({
      name: 'normalizeTsValueAfterUnit',
      pattern: '2,15-50 * * 3-12 3 *',
      ts,
    });

    counter.resolver.decorateTsWithClosestValidValueAfterUnit('day', ts, true);
  }).toThrow();
});
