import Resolver from './Resolver';
import utils from './utils';
const { pick } = utils;

export default class CronJob {
  constructor(opts) {
    const { fn } = opts;
    const props = pick(opts, ['id', 'pattern']);

    this.resolver = new Resolver(props);
    this.timeId = null;
  }

  watch(timeout) {
    return setTimeout(this.funcWithTimeout, timeout);
  }

  watchRoutine() {
    const timeout = this.resolver.nextTimeout();
    this.timeId = this.watch(timeout);
  }

  funcWithTimeout() {
    this.fn.call(null);
    this.watchRoutine();
  }

  start() {
    this.watchRoutine();
  }

  stop() {
    window.clearTimeout(this.timeId);
  }

  resume() {
    this.resolver.reset();
    this.watchRoutine();
  }
}
