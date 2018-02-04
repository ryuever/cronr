import Resolver, { ResolverConstructor } from './Resolver';
import utils from './utils';
import { callbackFn } from './Cronr';
const { pick } = utils;

export interface ICronrJob {
  watch(timeout: number) : number;
  watchRoutine(): void;
  funcWithTimeout(): void;
  stop(): void;
  resume(): void;
};

export interface CronJobConstructorProps {
  fn: callbackFn,
  id: string,
  pattern: string,
}

// type keyType = 'id' | 'pattern';

export default class CronJob {
  public resolver: Resolver;
  public timeId: null | number;
  private fn: callbackFn;

  constructor(opts: CronJobConstructorProps) {
    const { fn } = opts;

    const keys: Array<'id' | 'pattern'> = ['id', 'pattern'];
    const props: ResolverConstructor = pick(opts, keys);

    this.fn = fn;
    this.resolver = new Resolver(props);
    this.timeId = null;
  }

  public watch(timeout: number): number {
    return setTimeout(this.funcWithTimeout, timeout);
  }

  private watchRoutine(): void {
    const timeout = this.resolver.next();
    this.timeId = this.watch(timeout);
  }

  private funcWithTimeout(): void {
    this.fn.call(null);
    this.watchRoutine();
  }

  public start(): void {
    this.watchRoutine();
  }

  public stop(): void {
    window.clearTimeout(this.timeId);
  }

  public resume(): void {
    this.resolver.reset();
    this.watchRoutine();
  }
}
