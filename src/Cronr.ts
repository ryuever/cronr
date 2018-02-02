import CronJob from './CronJob';

export interface singletonProps {
  count: number,
  jobs: CronJobList,
};

export type callbackFn = (any) => any;

let singleton: null | singletonProps = null;

export interface CronJobList {
  [index: string]: CronJob
};

export default class Cronr {
  public count: number;
  public jobs: CronJobList;

  constructor() {
    this.count = 0;
  }

  static buildId(): string {
    return `cronr-${singleton.count++}`;
  }

  static create(pattern: string, fn: callbackFn): CronJob {
    if (!singleton) singleton = new Cronr();
    const id = Cronr.buildId();

    singleton.jobs[id] = new CronJob({ id, pattern, fn });

    return singleton.jobs[id];
  }
}
