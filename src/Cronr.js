import CronJob from './CronJob';
import raf from 'raf';

let singleton = null;

export default class Cronr {
  constructor() {
    this.count = 0;
    this.jobs = {};
    this.heartbeating = false;
  }

  isValidCronPatter() {

  }

  static buildId() {
    return `cronr-${singleton.count++}`;
  }

  static create(pattern, fn) {
    if (!singleton) singleton = new Cronr();
    const id = Cronr.buildId();

    singleton.jobs[id] = new CronJob({ id, pattern, fn });
    singleton.heartbeat();

    return singleton.jobs[id];
  }

  heartbeatTick() {
    // ...
  }

  // inspired by
  heartbeat() {
    if (this.heartbeating) return;
    this.heartbeating = true;

    setTimeout(() => {
      console.log('time out')
    }, 1000);
    raf(function tick() {
      // Animation logic
      console.log('tick');
      raf(tick)
    })
  }
}
