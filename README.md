# cronr &middot; [![npm version](https://img.shields.io/npm/v/cronr.svg?style=flat)](https://www.npmjs.com/package/cronr) [![NPM downloads](https://img.shields.io/npm/dm/cronr.svg?style=flat-square)](http://www.npmtrends.com/cronr)

Inspired from unix `cron`, `cronr` is served as an time-based job scheduler which runs on `browser` and `Node.js`. It follows the basic standard macro pattern and makes somehow enhancement.

---

## Feature

- More time control support, even to `millisecond`
- Works on browser and `Node.js`
- By default, jobs control support five available actions : `start`, `stop`, `stop`, `resume` and `clear`.
- Standalone module to help calculate `nextTick` only, which provide a `Iterator` object to fetch.

## Online demo

[Cronr stroies -- online samples](https://ryuever.github.io/cronr/)

## Installation

- use `npm` to install

```bash
npm install cronr
```

- or use `yarn` with

```bash
yarn add cronr
```

## Running on browser

- Downloading the `Cronr.umd.min.js(for time job scheduler)` or `CronrCounter.umd.min.js(to fetch the nextTick only)` from './lib/minified';
- Add an `<script>` tag which includes the `bundle` file on your page
- Refer to [Cronr](#cronr) or [CronrCounter](#cronrcounter) for usage detail

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

## CronrCounter

It mainly consists of :

- Parsing `cron` macro pattern
- A `Iterator` property which to provide the `nextTick` value.

### - CronrCounter(opts: obj)

opts has the following avaible properties.

| Property | Description | Type | Required| Default |
| -------- | ----------- | ---- | --- | --- |
| name | Module name | string | false | undefined |
| pattern | `cron` macro pattern | string | true | -- |
| ts   | Time Starting point, which means all the `nextTick` is calculated based on this value | Date | false | `new Date()`|

### - Basic Usage

```js
import CronrCounter from 'cronr/CronrCounter';
const counter = new CronrCounter({
  name: 'testing',
  pattern: '2,5 * * 3-12 3 *',
  ts: new Date(2018, 7, 22, 10, 23, 16),
});

const data = counter.result;
const result = data.next().value;  // '3/3/2019, 12:00:02 AM'
const result2 = data.next().value; // '3/3/2019, 12:00:05 AM'
```

## Cronr Macro Pattern

It mainly inspired from [Cron - Wikipedia](https://en.wikipedia.org/wiki/Cron). Comparing with original format, it follows the basic `syntax`; For example, Every pattern is seperated by space; It still support special meaning characters(`-`, `,` and `*` etc);

However, it has addtional enhancement. Recently, it support time format till milliseconds. Just as follows showing.

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

### How to write an valid macro pattern

You must provide a string which combines with at least `5` valid macro token(`*` or `1,2,4-5` will be considered as a token); It means if the token length is less than `7`, it will has an auto-completion on the heading position.

```js
const patten = '* * 5 * * * *'   // retain the same
const pattern = '5 * * * *';     // => '* * 5 * * * *'
const pattern2 = '5 * * * * *';  // => '* 5 * * * * *'
```

### Simple macro samples

- _Pay attention to the token length_

```js
'* * * * * * *'       // running on every millisecond

'*/10 * * * * *'      // running on every 10 seconds

'30 4 1,15 * 5'       // run at 4:30 am on the 1st and 15th of each month, plus every Friday

'15 14 1 * *'         // run at 2:15pm on the first of every month

'5 4 * * sun'         // run at 5 after 4 every sunday
```

> if both "day of month" and "day of week" are restricted (not "*"), then one or both must match the current day.

## Todo

### Nonstandard predefined scheduling definitions

To support `preset` macro pattern, such as `@yearly` which means run once a year at midnight of 1 Jan.

## Futher Reading for Cron Macro

### Online tools to simulate cron pattern

- [Free Online Cron Expression Generator and Describer - FreeFormatter.com](https://www.freeformatter.com/cron-expression-generator-quartz.html)

- [Describes Cron expressions as human readable text](https://cronexpressiondescriptor.azurewebsites.net/)

### Wikis

- [Cron - Wikipedia](https://en.wikipedia.org/wiki/Cron)
- [crontab(5)](https://www.freebsd.org/cgi/man.cgi?query=crontab&sektion=5&manpath=freebsd-release-ports)