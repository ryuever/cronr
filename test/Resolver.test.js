import Cronr from '../src/Cronr';
const noop = () => {};

test('matchDateOrWeekday on sunday', () => {
  const job = Cronr.create('2,15-50,4-12 * * 1-12 * 0', noop);
  job.resolver.ts = new Date(2018, 2, 4, 10, 11, 16);
  const result = job.resolver.matchDateOrWeekday();
  expect(result).toEqual(true);
})

test('matchDateOrWeekday', () => {
  const job = Cronr.create('2,15-50,4-12 * * 1-31 * *', noop);
  const result = job.resolver.matchDateOrWeekday();
  expect(result).toEqual(true);
})

test('full wildcard', () => {
  const job = Cronr.create('* * * * * *', noop);

  job.resolver.ts = new Date(2018, 1, 30, 10, 11, 16);
  const timeout = job.resolver.next();

  expect(timeout).toBe(0);
})

test('calculate next time to call', () => {
  const job = Cronr.create('20 * * * * *', noop);

  job.resolver.ts = new Date(2018, 1, 30, 10, 11, 16);
  const timeout = job.resolver.next();

  expect(timeout).toBe(4 * 1000);
})

test('calculate next time to call 2', () => {
  const job = Cronr.create('20 * * * * *', noop);

  job.resolver.ts = new Date(2018, 1, 30, 10, 11, 22);
  const timeout = job.resolver.next();

  expect(timeout).toBe(58 * 1000);
})

test('calculate next time to call 2', () => {
  const job = Cronr.create('3,15 * * * * *', noop);

  job.resolver.ts = new Date(2018, 1, 30, 10, 11, 22);
  const timeout = job.resolver.next();

  expect(timeout).toBe(41 * 1000);
})

test('calculate next time to call 2', () => {
  const job = Cronr.create('3,15 14 * * * *', noop);

  job.resolver.ts = new Date(2018, 1, 30, 10, 11, 22);
  const timeout = job.resolver.next();

  expect(timeout).toBe(161 * 1000);
})

