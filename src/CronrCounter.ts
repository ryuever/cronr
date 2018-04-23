import Resolver, { ResolverConstructor } from "./Resolver";

export interface CronrCounterConstructorProps {
  name: string;
  pattern: string;
}

export default class CronrCounter {
  public name: string;
  public resolver: Resolver;
  public result: Iterator<Date>;

  constructor(opts: CronrCounterConstructorProps) {
    const { name, ...rest } = opts;
    this.name = name;
    this.resolver = new Resolver(<ResolverConstructor>rest);
    this.result = this.resolver[Symbol.iterator]();
  }
}
