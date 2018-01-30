import Cronr from '../src/Cronr';

test('heart beat', () => {
  const job = Cronr.create('2,15-50,4-12 * * * * *', () => {
    console.log('tick');
  })

  job.start = new Date(2018, 1, 30, 10, 11, 3);
  const { second } = job.nextTimeToCall();
  expect(second).toEqual(1);

  job.start = new Date(2018, 1, 30, 10, 11, 51);
  const { second: second2 } = job.nextTimeToCall();
  expect(second2).toEqual(11);

  job.start = new Date(2018, 1, 30, 10, 11, 13);
  const { second: second3 } = job.nextTimeToCall();
  expect(second3).toEqual(2);

  job.start = new Date(2018, 1, 30, 10, 11, 16);
  const { second: second4 } = job.nextTimeToCall();
  expect(second4).toEqual(0);

  job.start = new Date(2018, 1, 30, 10, 11, 10);
  const { second: second5 } = job.nextTimeToCall();
  expect(second5).toEqual(0);
})
