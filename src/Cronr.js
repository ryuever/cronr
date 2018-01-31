import CronJob from './CronJob';
import raf from 'raf';

let singleton = null;

export default class Cronr {
  constructor() {
    this.count = 0;
    this.jobs = {};
    this.heartbeating = false;
  }

  static buildId() {
    return `cronr-${singleton.count++}`;
  }

  static create(pattern, fn) {
    if (!singleton) singleton = new Cronr();
    const id = Cronr.buildId();

    singleton.jobs[id] = new CronJob({ id, pattern, fn });

    return singleton.jobs[id];
  }
}
