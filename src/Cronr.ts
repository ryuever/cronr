import Resolver, { ResolverConstructor } from "./Resolver";

export interface CronConstructorProps {
  name: string;
  pattern: string;
}

export default class Cronr {
  public name: string;
  public resolver: Resolver;
  public result: Iterator<Date>;

  constructor(opts: CronConstructorProps) {
    const { name, ...rest } = opts;
    this.name = name;
    this.resolver = new Resolver(<ResolverConstructor>rest);
    this.result = this.resolver[Symbol.iterator]();
  }
}
