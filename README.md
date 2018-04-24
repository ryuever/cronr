# cronr &middot; [![npm version](https://img.shields.io/npm/v/cronr.svg?style=flat)](https://www.npmjs.com/package/cronr) [![NPM downloads](https://img.shields.io/npm/dm/cronr.svg?style=flat-square)](http://www.npmtrends.com/cronr)

Inspired from unix `cron` which also privide an time-based job scheduler function. It will follow the basic standard macro. However, it has additional benifits.

---

## feature

- More time control support, even to `millisecond`
- Works on browser and `Node.js`
- By default, jobs control support five available actions : `start`, `stop`, `stop`, `resume` and `clear`.
- Standalone module to help calculate `nextTick` only, which provide a `Iterator` object to fetch.

## installation

- use `npm` to install

```bash
npm install cronr
```

- or use `yarn` with

```bash
yarn add cronr
```

## Cronr

Job scheduler, which support `cron` macro pattern and has lots of handful methods.

### - Cronr(pattern: string, callback: function, opts: obj)

| Property | Description | Type | Required|
| -------- | ----------- | ---- | --- |
| pattern  | `cron` macro format string | string | yes|
| callback | Function will be triggerd when time hit `nextTick` | function | yes|

opts has following available `parameters`

| Property | Description | Type | Required| Default |
| -------- | ----------- | ---- | --- | ---- |
| startTime | Starting point, when to start calculate the `nextTick` | Date | false | `new Date()` |
| endTime | Ending point, the schedulerd jobs will be canceled after this time | Date | false | none |
| immediate | When to trigger `callback` immediately when you start the job | boolean | false | false |

#### methods

| Method | Description | Signature |
| ------ | ----------- | ---- |
| start  | Start the `initial` job | (): void => {} |
| stop  | Suspend the `running` job | (): void => {} |
| resume  | Resume the `suspend` job | (): void => {} |
| clear  | Clear the job | (): void => {} |
| restart  | Restart the register job | (): void => {} |

However, every method invoke has an order restriction.

- `start` only could be followed by `stop` and `clear` method.

| Method | Followed By |
| ------ | ----------- |
| start  | `["stop", "clear"]` |
| stop   | `["resume", "clear"]` |
| clear  | `["restart"]` |

#### Basic Usage

```js
import Cronr from 'cronr';
// trigger on every second, 10, 20, 30, 40, 50, 00
const pattern = '*/10 * * * * *';
let count = 1;
const cb = () => count++;

const job = new Cronr(pattern, cb, {
    startTime: new Date(2018, 3, 23, 10, 23, 36),
});

job.start();
```

## Todo

### Nonstandard predefined scheduling definitions

To support `preset` macro pattern, such as `@yearly` which means run once a year at midnight of 1 Jan.

## cron syntax

```bash
*   *   *   *   *   *   *
┬   ┬   ┬   ┬   ┬   ┬   ┬
|   |   |   |   |   |   |
|   |   |   |   |   |   |_________  day of week (0 - 6)
|   |   |   |   |   |_____________  month (1 - 12)
|   |   |   |   |_________________  day of month (1 - 31)
|   |   |   |_____________________  hour (0 - 23)
|   |   |_________________________  minute (0 - 59)
|   |_____________________________  second (0 - 59, optional)
|_________________________________  milliSecond (0 - 999, optional)
```

- if both "day of month" and "day of week" are restricted (not "*"), then one or both must match the current day.()

## Cronr

- If it is provider with a pattern and startTime time, it will return a iterable object.`croner.next()` will return the `timeout` it should be run on next trigger.
- provide a option to support run immediately.

## range

[crontab(5)](https://www.freebsd.org/cgi/man.cgi?query=crontab&sektion=5&manpath=freebsd-release-ports)

## Online tools to simulate cron pattern

[Free Online Cron Expression Generator and Describer - FreeFormatter.com](https://www.freeformatter.com/cron-expression-generator-quartz.html)

[Describes Cron expressions as human readable text](https://cronexpressiondescriptor.azurewebsites.net/)

## How to write cron pattern

- [Cron - Wikipedia](https://en.wikipedia.org/wiki/Cron)
- [crontab(5)](https://www.freebsd.org/cgi/man.cgi?query=crontab&sektion=5&manpath=freebsd-release-ports)