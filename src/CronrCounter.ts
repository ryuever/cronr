import Resolver, { ResolverConstructor } from "./Resolver";

export interface CronrCounterConstructorProps {
  name: string;
  pattern: string;
  ts?: Date;
}

export default class CronrCounter {
  public name: string;
  public resolver: Resolver;
  public result: Iterator<Date>;

  constructor(opts: CronrCounterConstructorProps) {
    const { name, pattern, ts } = opts;
    this.name = name;
    this.resolver = new Resolver(<ResolverConstructor>{
      pattern,
      ts
    });
    this.result = this.resolver[Symbol.iterator]();
  }
}
