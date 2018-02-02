# cronr

- spawn a thread to handle timer.
- only trigger on page present.

## install

```bash
npm install cronr
```

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

- if both "day of month" and "day of week" are restricted (not "*"), then one or both must match the current day.

## Usage

## API

### `Cronr`

#### Create(pattern, callback)

### next

### nextTimeToCall

### weekly

### hourly

### monthly

### daily

## Examples

```js

```

## How to trigger on `second` unit

Cron's granularity is in minutes and was not designed to wake up every x seconds to run something.

[Running a cron every 30 seconds](https://stackoverflow.com/questions/9619362/running-a-cron-every-30-seconds)

## crontab syntax

[crontab 定时任务](http://linuxtools-rst.readthedocs.io/zh_CN/latest/tool/crontab.html)

[Linux之crontab定时任务](https://www.jianshu.com/p/838db0269fd0)

[Cron Expression Generator & Explainer - Quartz](https://www.freeformatter.com/cron-expression-generator-quartz.html)

wiki : exception

While normally the job is executed when the time/date specification fields all match the current time and date, there is one exception: if both "day of month" (field 3) and "day of week" (field 5) are restricted (not "*"), then one or both must match the current day.[3]

## using web worker to handle count down on background

It will tell the forground by event.

### Error pattern

#### cant mixed in frequency and literal pattern

```bash
# 非时间的约束主要是两种，一个是星期，一个是日期；它俩是一个或的概念。
# 每个月的4号和每个礼拜的礼拜一到礼拜三的早上11点
0 11 4 * 1-3 command line
```

### for processing second and others

because timer tick on every second. so if current second matchs pattern, then we should compare whether next second match.

## README

[cron-parser](https://raw.githubusercontent.com/harrisiirak/cron-parser/master/README.md)