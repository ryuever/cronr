import CronJob from './CronJob';

export interface singletonProps {
  count: number,
  jobs: CronJobList,
};

export type callbackFn = () => any;

export interface CronJobList {
  [index: string]: CronJob
};

export default class Cronr {
  public count: number;
  public jobs: CronJobList;
  public static singleton: singletonProps;

  constructor() {
    this.count = 0;
    this.jobs = Object.create(null);
  }

  static buildId(): string {
    if (!Cronr.singleton) Cronr.singleton = new Cronr();
    return `cronr-${Cronr.singleton.count++}`;
  }

  static create(pattern: string, fn: callbackFn): CronJob {
    if (!Cronr.singleton) Cronr.singleton = new Cronr();

    const id = Cronr.buildId();

    Cronr.singleton.jobs[id] = new CronJob({ id, pattern, fn });

    return Cronr.singleton.jobs[id];
  }
}
