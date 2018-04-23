import CronrCounter from '../src/CronrCounter';
import format from './utils/format';

test('check result', () => {
  const counter = new CronrCounter({
    name: 'testing',
    pattern: '2,5 * * 3-12 3 *',
    ts: new Date(2018, 7, 22, 10, 23, 16),
  });

  const data = counter.result;
  const result = data.next().value;
  expect(format(result)).toBe('3/3/2019, 12:00:02 AM');

  const result2 = data.next().value;
  expect(format(result2)).toBe('3/3/2019, 12:00:05 AM');
});

test('check result with iterator', () => {
  const counter = new CronrCounter({
    name: 'testing',
    pattern: '2,5-11 * * 3-12 8 *',
    ts: new Date(2018, 7, 22, 10, 23, 16),
  });

  const data = counter.result;
  const result = data.next().value;
  expect(format(result)).toBe('8/3/2018, 12:00:02 AM');

  const result2 = data.next().value;
  expect(format(result2)).toBe('8/3/2018, 12:00:05 AM');

  const result3 = data.next().value;
  expect(format(result3)).toBe('8/3/2018, 12:00:06 AM');
});

test('`* * * * *` run every minute', () => {
  const counter = new CronrCounter({
    name: 'testing',
    pattern: '* * * * *',
    ts: new Date(2018, 7, 22, 10, 23, 16),
  });

  const data = counter.result;
  const result = data.next().value;
  expect(format(result)).toBe('8/22/2018, 10:23:16 AM');

  const result2 = data.next().value;
  expect(format(result2)).toBe('8/22/2018, 10:24:16 AM');

  const result3 = data.next().value;
  expect(format(result3)).toBe('8/22/2018, 10:25:16 AM');
});

test('`* * * * * *` run every second', () => {
  const counter = new CronrCounter({
    name: 'testing',
    pattern: '* * * * * *',
    ts: new Date(2018, 7, 22, 10, 23, 16),
  });

  const data = counter.result;
  const result = data.next().value;
  expect(format(result)).toBe('8/22/2018, 10:23:16 AM');

  const result2 = data.next().value;
  expect(format(result2)).toBe('8/22/2018, 10:23:17 AM');

  const result3 = data.next().value;
  expect(format(result3)).toBe('8/22/2018, 10:23:18 AM');
});

test('`* * * * * * *` run every millisecond', () => {
  const toNum = date => date.valueOf();
  const ts = new Date(2018, 7, 22, 10, 23, 16);
  const clone = new Date(toNum(ts));

  const counter = new CronrCounter({
    name: 'testing',
    pattern: '* * * * * * *',
    ts,
  });

  const data = counter.result;
  const result = data.next().value;

  expect(toNum(result)).toBe(toNum(clone) + 0);

  const result2 = data.next().value;
  expect(toNum(result2)).toBe(toNum(clone) + 1);

  const result3 = data.next().value;
  expect(toNum(result3)).toBe(toNum(clone) + 2);
});

test('`*/10 * * * * *` run every ten seconds', () => {
  const counter = new CronrCounter({
    name: 'testing',
    pattern: '*/10 * * * * *',
    ts: new Date(2018, 7, 22, 10, 23, 36),
  });

  const data = counter.result;
  const result = data.next().value;
  expect(format(result)).toBe('8/22/2018, 10:23:40 AM');

  const result2 = data.next().value;
  expect(format(result2)).toBe('8/22/2018, 10:23:50 AM');

  const result3 = data.next().value;
  expect(format(result3)).toBe('8/22/2018, 10:24:00 AM');
});

test('`* */15 * * * *` run every fifteen minutes', () => {
  const counter = new CronrCounter({
    name: 'testing',
    pattern: '* */15 * * * *',
    ts: new Date(2018, 7, 22, 10, 23, 36),
  });

  const data = counter.result;
  const result = data.next().value;
  expect(format(result)).toBe('8/22/2018, 10:30:00 AM');

  const result2 = data.next().value;
  expect(format(result2)).toBe('8/22/2018, 10:45:00 AM');

  const result3 = data.next().value;
  expect(format(result3)).toBe('8/22/2018, 11:00:00 AM');
});

test('`* 15 */2 * * *` run on fifteen minutes at every 2 hours', () => {
  const counter = new CronrCounter({
    name: 'testing',
    pattern: '* 15 */2 * * *',
    ts: new Date(2018, 7, 22, 10, 23, 36),
  });

  const data = counter.result;
  const result = data.next().value;
  expect(format(result)).toBe('8/22/2018, 12:15:00 PM');

  const result2 = data.next().value;
  expect(format(result2)).toBe('8/22/2018, 2:15:00 PM');

  const result3 = data.next().value;
  expect(format(result3)).toBe('8/22/2018, 4:15:00 PM');
});

test('`* 15 15-20/2 * * *` range with step', () => {
  const counter = new CronrCounter({
    name: 'testing',
    pattern: '* 15 15-20/2 * * *',
    ts: new Date(2018, 7, 22, 10, 23, 36),
  });

  const data = counter.result;
  const result = data.next().value;
  expect(format(result)).toBe('8/22/2018, 3:15:00 PM');

  const result2 = data.next().value;
  expect(format(result2)).toBe('8/22/2018, 5:15:00 PM');

  const result3 = data.next().value;
  expect(format(result3)).toBe('8/22/2018, 7:15:00 PM');
});

test.only('`* 15 15-20/2 * * 1` range with step', () => {
  const counter = new CronrCounter({
    name: 'testing',
    pattern: '* 15 15-20/2 * * 1',
    ts: new Date(2018, 3, 22, 10, 23, 36),
  });
});
