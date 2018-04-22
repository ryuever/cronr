import Resolver, { ResolverConstructor } from './Resolver';

export interface CronConstructorProps {
  name: string,
  pattern: string,
}

export default class Cronr {
  public name: string;
  public resolver: Iterator<Date>;

  constructor(opts: CronConstructorProps) {
    const { name, ...rest } = opts;
    this.name = name;
    const resolver = new Resolver(<ResolverConstructor>rest);
    this.resolver = resolver[Symbol.iterator]();
  }
}
