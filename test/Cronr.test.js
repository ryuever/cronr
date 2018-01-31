import Cronr from '../src/Cronr';

test('matchDateOrWeekday', () => {
  const job = Cronr.create('2,15-50,4-12 * * 1-12 * 2', () => {
    console.log('tick');
  })
  const result = job.matchDateOrWeekday();
  expect(result).toEqual(false);
})

test('matchDateOrWeekday', () => {
  const job = Cronr.create('2,15-50,4-12 * * 1-31 * *', () => {
    console.log('tick');
  })
  const result = job.matchDateOrWeekday();
  expect(result).toEqual(true);
})

test('calculate next time to call', () => {
  const job = Cronr.create('20 * * * * *', () => {
    console.log('tick');
  })

  job.ts = new Date(2018, 1, 30, 10, 11, 16);
  const timeout = job.nextTimeout();

  expect(timeout).toBe(4 * 1000);
})

test('calculate next time to call 2', () => {
  const job = Cronr.create('20 * * * * *', () => {
    console.log('tick');
  })

  job.ts = new Date(2018, 1, 30, 10, 11, 22);
  const timeout = job.nextTimeout();

  expect(timeout).toBe(58 * 1000);
})
