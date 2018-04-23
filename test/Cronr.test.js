import Cronr from '../src/Cronr';

test('Cronr basic works', () => {
  jest.useFakeTimers();

  const pattern = '*/10 * * * * *';
  let count = 1;
  const cb = () => {
    count++;
  };
  const job = new Cronr(pattern, cb, {
    startTime: new Date(2018, 3, 23, 10, 23, 36),
  });
  job.start();

  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(
    expect.any(Function),
    expect.any(Number)
  );

  jest.runOnlyPendingTimers();
  expect(count).toBe(2);

  expect(setTimeout).toHaveBeenCalledTimes(2);
  jest.runOnlyPendingTimers();
  expect(count).toBe(3);

  expect(setTimeout).toHaveBeenCalledTimes(3);
  jest.runOnlyPendingTimers();
  expect(count).toBe(4);

  jest.clearAllTimers();
});

test('verify error message', () => {
  const pattern = '*/20 * * * * *';
  const cb = () => {};
  const job = new Cronr(pattern, cb, {
    startTime: new Date(2018, 3, 23, 10, 23, 36),
  });
  job.start();
  job.stop();

  expect(() => {
    job.restart();
  }).toThrowError(
    `Current status is 'suspend', you can only do ["clear","resume"] action`
  );
});

test('verify endTime works', () => {
  jest.useFakeTimers();
  const callback = jest.fn();
  const pattern = '*/20 * * * * *';

  const job = new Cronr(pattern, callback, {
    startTime: new Date(2018, 3, 23, 10, 23, 36),
    endTime: new Date(new Date().valueOf() + 20 * 1000),
  });
  job.start();
  jest.runAllTimers();

  expect(callback).toHaveBeenCalledTimes(1);
  jest.clearAllTimers();
});

test('verify endTime works', () => {
  jest.useFakeTimers();
  const callback = jest.fn();
  const pattern = '*/20 * * * * *';

  const job = new Cronr(pattern, callback, {
    startTime: new Date(2018, 3, 23, 10, 23, 36),
    endTime: new Date(new Date().valueOf() + 20 * 2 * 1000),
  });
  job.start();
  jest.runAllTimers();

  expect(callback).toHaveBeenCalledTimes(2);
  jest.clearAllTimers();
});

test('verify endTime works', () => {
  jest.useFakeTimers();
  const callback = jest.fn();
  const pattern = '*/20 * * * * *';

  const job = new Cronr(pattern, callback, {
    startTime: new Date(2018, 3, 23, 10, 23, 36),
    endTime: new Date(new Date().valueOf() + 20 * 3 * 1000),
  });
  job.start();
  jest.runAllTimers();

  expect(callback).toHaveBeenCalledTimes(3);
  jest.clearAllTimers();
});

test('Verify Cronr callback run times', () => {
  jest.useFakeTimers();
  const callback = jest.fn();

  const pattern = '*/10 * * * * *';

  const job = new Cronr(pattern, callback, {
    startTime: new Date(2018, 3, 23, 10, 23, 36),
  });
  job.start();

  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(
    expect.any(Function),
    expect.any(Number)
  );

  expect(callback).not.toBeCalled();
  jest.runOnlyPendingTimers();
  expect(callback).toBeCalled();
  expect(callback).toHaveBeenCalledTimes(1);

  expect(setTimeout).toHaveBeenCalledTimes(2);
  jest.runOnlyPendingTimers();
  expect(callback).toHaveBeenCalledTimes(2);

  expect(setTimeout).toHaveBeenCalledTimes(3);
  jest.runOnlyPendingTimers();
  expect(callback).toHaveBeenCalledTimes(3);

  jest.clearAllTimers();
});

test('Verify Cronr callback run times with `immediate` truthy', () => {
  jest.useFakeTimers();
  const callback = jest.fn();

  const pattern = '*/10 * * * * *';

  const job = new Cronr(pattern, callback, {
    startTime: new Date(2018, 3, 23, 10, 23, 36),
    immediate: true,
  });
  job.start();

  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(
    expect.any(Function),
    expect.any(Number)
  );

  expect(callback).toBeCalled();
  jest.runOnlyPendingTimers();
  expect(callback).toBeCalled();
  expect(callback).toHaveBeenCalledTimes(2);

  jest.clearAllTimers();
});

test('resume will not omit `immediate` option', () => {
  jest.useFakeTimers();
  const callback = jest.fn();

  const pattern = '*/10 * * * * *';

  const job = new Cronr(pattern, callback, {
    startTime: new Date(2018, 3, 23, 10, 23, 36),
    immediate: true,
  });
  job.start();

  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(
    expect.any(Function),
    expect.any(Number)
  );

  expect(callback).toBeCalled();
  jest.runOnlyPendingTimers();
  expect(callback).toBeCalled();
  expect(callback).toHaveBeenCalledTimes(2);

  job.stop();
  job.resume();
  expect(callback).toHaveBeenCalledTimes(2);

  jest.clearAllTimers();
});

test('restart will recognize `immediate` option again', () => {
  jest.useFakeTimers();
  const callback = jest.fn();

  const pattern = '*/10 * * * * *';

  const job = new Cronr(pattern, callback, {
    startTime: new Date(2018, 3, 23, 10, 23, 36),
    immediate: true,
  });
  job.start();

  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(
    expect.any(Function),
    expect.any(Number)
  );

  expect(callback).toBeCalled();
  jest.runOnlyPendingTimers();
  expect(callback).toBeCalled();
  expect(callback).toHaveBeenCalledTimes(2);

  job.clear();
  job.restart();
  expect(callback).toHaveBeenCalledTimes(3);

  jest.clearAllTimers();
});

test('Cronr stop function', () => {
  jest.useFakeTimers();

  const pattern = '*/20 * * * * *';
  let count = 1;
  const cb = () => {
    count++;
  };
  const job = new Cronr(pattern, cb, {
    startTime: new Date(2018, 3, 23, 10, 23, 36),
  });
  job.start();

  expect(setTimeout).toHaveBeenCalledTimes(1);

  jest.runOnlyPendingTimers();
  expect(count).toBe(2);
  job.stop();

  expect(clearTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenCalledTimes(2);
  jest.runOnlyPendingTimers();
  expect(count).toBe(2);

  jest.clearAllTimers();
});

test('Cronr stop and resume function', () => {
  jest.useFakeTimers();

  const pattern = '*/20 * * * * *';
  let count = 1;
  const cb = () => {
    count++;
  };
  const job = new Cronr(pattern, cb, {
    startTime: new Date(2018, 3, 23, 10, 23, 36),
  });
  job.start();

  expect(setTimeout).toHaveBeenCalledTimes(1);

  jest.runOnlyPendingTimers();
  expect(count).toBe(2);
  job.stop();

  expect(clearTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenCalledTimes(2);
  jest.runOnlyPendingTimers();
  expect(count).toBe(2);

  job.resume();
  expect(setTimeout).toHaveBeenCalledTimes(3);
  jest.runOnlyPendingTimers();
  expect(count).toBe(3);

  jest.clearAllTimers();
});

test('Cronr clear function', () => {
  jest.useFakeTimers();

  const pattern = '*/20 * * * * *';
  let count = 1;
  const cb = () => {
    count++;
  };
  const job = new Cronr(pattern, cb, {
    startTime: new Date(2018, 3, 23, 10, 23, 36),
  });
  job.start();

  expect(setTimeout).toHaveBeenCalledTimes(1);

  jest.runOnlyPendingTimers();
  expect(count).toBe(2);
  job.clear();

  expect(clearTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenCalledTimes(2);
  jest.runOnlyPendingTimers();
  expect(count).toBe(2);

  jest.clearAllTimers();
});

test('Cronr stop and resume function', () => {
  jest.useFakeTimers();

  const pattern = '*/20 * * * * *';
  let count = 1;
  const cb = () => {
    count++;
  };
  const job = new Cronr(pattern, cb, {
    startTime: new Date(2018, 3, 23, 10, 23, 36),
  });
  job.start();

  expect(setTimeout).toHaveBeenCalledTimes(1);

  jest.runOnlyPendingTimers();
  expect(count).toBe(2);
  job.clear();

  expect(clearTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenCalledTimes(2);
  jest.runOnlyPendingTimers();
  expect(count).toBe(2);

  job.restart();
  expect(setTimeout).toHaveBeenCalledTimes(3);
  jest.runOnlyPendingTimers();
  expect(count).toBe(3);

  jest.clearAllTimers();
});
