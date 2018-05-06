import CronrCounter from "./CronrCounter";
import utils from "./utils";
const { toNum } = utils;

type fn = () => {};
const INITIAL = "initial";
const RUNNING = "running";
const SUSPEND = "suspend";
const CLEAR = "clear";
type IStatus = "initial" | "running" | "suspend" | "clear";

export interface IOptions {
  immediate: boolean;
  startTime: Date;
  endTime?: Date;
}

export default class Cronr {
  private pattern: string;
  private cb: fn;
  private counter: CronrCounter;
  private immediate: boolean;
  private iterator: Iterator<Date>;
  private timeoutId: number;
  private endTime?: Date;
  private status: IStatus;
  public nextTick: Date;

  constructor(
    pattern: string,
    cb: fn,
    opts: IOptions = <IOptions>{
      immediate: false,
      startTime: new Date()
    }
  ) {
    this.pattern = pattern;
    this.cb = cb;
    const { startTime, immediate } = opts;

    this.counter = new CronrCounter(<any>{
      pattern: this.pattern,
      ts: startTime
    });
    this.iterator = this.counter.result;
    this.immediate = immediate;
    this.status = INITIAL;
    this.endTime = opts.endTime;
  }

  private resolveNextValidAction(status: IStatus) {
    switch (status) {
      case INITIAL:
        return ["start"];
      case RUNNING:
        return ["stop", "clear"];
      case SUSPEND:
        return ["clear", "resume"];
      case CLEAR:
        return ["restart"];
    }
  }

  public start(bypass?: boolean) {
    if (this.status !== INITIAL) {
      throw new Error(this.msg(this.status));
    }

    if (!bypass && this.immediate) {
      this.cb.call(null);
    }

    const now = new Date();
    let nextTick = this.iterator.next().value;

    // To make sure nextTick must not less than `now`;
    while (nextTick < now) {
      nextTick = this.iterator.next().value;
    }

    let timeout = toNum(nextTick) - toNum(now);

    // To avoid dulplicate running;
    if (timeout === 0 && this.immediate) {
      nextTick = this.iterator.next().value;
      timeout = toNum(nextTick) - toNum(now);
    }

    this.nextTick = nextTick;

    const callback = () => {
      this.cb.call(this);
      const nextTick = this.iterator.next().value;

      if (!this.endTime || this.endTime > nextTick) {
        const timeout = toNum(nextTick) - toNum(new Date());
        this.nextTick = nextTick;
        this.timeoutId = setTimeout(callback, timeout);
      }
    };

    this.timeoutId = setTimeout(callback, timeout);
    this.status = RUNNING;
  }

  private msg(status: IStatus): string {
    return (
      `Current status is '${status}', ` +
      `you can only do ${JSON.stringify(
        this.resolveNextValidAction(status)
      )} action`
    );
  }

  // the next action should be `resume`;
  public stop() {
    if (this.status !== RUNNING) {
      throw new Error(this.msg(this.status));
    }

    clearTimeout(this.timeoutId);

    this.status = SUSPEND;
  }

  // the next action should be `restart`;
  public clear() {
    if (this.status !== RUNNING && this.status !== SUSPEND) {
      throw new Error(this.msg(this.status));
    }
    clearTimeout(this.timeoutId);
    this.status = CLEAR;
  }

  public restart() {
    if (this.status !== CLEAR) {
      throw new Error(this.msg(this.status));
    }
    this.status = INITIAL;
    this.start();
  }

  public resume() {
    if (this.status !== SUSPEND) {
      throw new Error(this.msg(this.status));
    }

    this.status = INITIAL;
    this.start(true);
  }
}
