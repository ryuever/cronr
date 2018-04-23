import Cronr from '../src/Cronr';

test('', () => {
  const pattern = '*/10 * * * * *';
  let count = 1;
  const cb = () => {
    count++;
  };
  const job = new Cronr(pattern, cb, {
    startTime: new Date(2018, 3, 23, 10, 23, 36),
  });
  job.start();
});
