export interface IDateInfo {
  milliSecond: number;
  second: number;
  minute: number;
  hour: number;

  day: number;
  month: number;

  weekday: number;
}

export default (ts: Date): IDateInfo => {
  return {
    milliSecond: ts.getMilliseconds(),
    second: ts.getSeconds(),
    minute: ts.getMinutes(),
    hour: ts.getHours(),

    day: ts.getDate(),
    month: ts.getMonth(),

    // `getDay` will return 0 if sunday, so there is a need to update to
    // `7` first.
    weekday: ts.getDay() === 0 ? 7 : ts.getDay()
  };
};
