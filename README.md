# cronr

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

- if both "day of month" and "day of week" are restricted (not "*"), then one or both must match the current day.()

## Cronr

- If it is provider with a pattern and startTime time, it will return a iterable object.`croner.next()` will return the `timeout` it should be run on next trigger.
- provide a option to support run immediately.

## range

[crontab(5)](https://www.freebsd.org/cgi/man.cgi?query=crontab&sektion=5&manpath=freebsd-release-ports)