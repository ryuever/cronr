export default () => {
  // ------------------- utils --------------------- //
  const isLeap = (year: number): boolean =>
    !!(year % 4) && !(year % 100) && !(year % 400);

  // resolveTsParts.ts
  interface IDateInfo {
    milliSecond: number;
    second: number;
    minute: number;
    hour: number;

    day: number;
    month: number;

    weekday: number;
  }

  const resolveTsParts = (ts: Date): IDateInfo => {
    return {
      milliSecond: ts.getMilliseconds(),
      second: ts.getSeconds(),
      minute: ts.getMinutes(),
      hour: ts.getHours(),

      day: ts.getDate(),
      month: ts.getMonth(),

      // `getDay` will return 0 if sunday, so there is a need to update to
      // `7` first.
      weekday: ts.getDay() === 0 ? 7 : ts.getDay()
    };
  };

  const min = (arr: Array<number>) => {
    return arr.reduce((prev, cur) => {
      if (cur) return typeof prev !== "undefined" ? Math.min(prev, cur) : cur;
      return prev;
    });
  };

  // toNum.ts
  const toNum: (t: Date) => number = (date: Date): number => date.valueOf();

  // ------------------- tokenTypes.ts

  const LITERAL = "literal";
  const RANGE = "range";
  const EVERY = "every";

  // --------------------- tokenParser ---------------- //
  const isString = (str: any): str is string => typeof str === "string";
  const isNumber = (obj: any): obj is number => typeof obj === "number";
  const weekdayToNumber = (str: string): number => weekdays.indexOf(str);
  const monthToNumber = (str: string): number => monthes.indexOf(str);
  const toInt = (int: any) => parseInt(int);
  const capitalizeFirst = (str: string): string =>
    str.charAt(0).toUpperCase() + str.toLowerCase().slice(1, 3);
  const capitalizeAndSlice = (str: string): string =>
    str.replace(/[a-zA-Z]+/g, capitalizeFirst);
  const minusOneIfNumber = (str: string): string =>
    str.replace(/[0-9]+/g, (str: string): string => {
      const number = parseInt(str);
      return `${number - 1}`;
    });

  // weekday is count from 1, 7 means sunday.
  const weekdays = [, "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const monthes = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  function combinePatterns(patterns: Array<RegExp>) {
    return (str: string) => {
      for (let pattern of patterns) {
        const match = pattern.test(str);
        if (match) return extractors[pattern.source](str);
      }

      throw new Error(`no match patterns`);
    };
  }

  const conbineWithProceed = (processors: Array<Function>) => (arr: any) =>
    processors.reduce((prev, cur) => cur(prev), arr);

  const preProcess = Object.create(null);
  preProcess.month = conbineWithProceed([capitalizeAndSlice, minusOneIfNumber]);
  preProcess.weekday = conbineWithProceed([capitalizeAndSlice]);

  const twoDigital = /^(\d{1,2})$/;
  const threeDigital = /^(\d{1,2})$/;
  const numberRange = /^(\d+)-(\d+)$/;
  const asterisk = /^(\*)(?:\/([0-9]*))?$/;
  const oneWithSlash = /^(\d{1,2})\/([0-9]*)$/;
  const twoNumberWithSlash = /^(\d+)-(\d+)\/([0-9]*)$/;
  const weekday = RegExp(
    `^(${weekdays.join("|")})(?:-(${weekdays.join("|")}))?$`
  );
  const month = RegExp(`^(${monthes.join("|")})(?:-(${monthes.join("|")}))?$`);

  const patterns = Object.create(null);
  patterns.milliSecond = combinePatterns([
    threeDigital,
    numberRange,
    asterisk,
    twoNumberWithSlash
  ]);
  patterns.second = combinePatterns([
    twoDigital,
    numberRange,
    asterisk,
    twoNumberWithSlash
  ]);
  patterns.minute = combinePatterns([
    twoDigital,
    numberRange,
    asterisk,
    twoNumberWithSlash
  ]);
  patterns.hour = combinePatterns([
    twoDigital,
    numberRange,
    asterisk,
    twoNumberWithSlash
  ]);
  patterns.day = combinePatterns([
    twoDigital,
    numberRange,
    asterisk,
    twoNumberWithSlash
  ]);
  patterns.month = combinePatterns([
    twoDigital,
    numberRange,
    asterisk,
    twoNumberWithSlash,
    month
  ]);
  patterns.weekday = combinePatterns([
    twoDigital,
    numberRange,
    asterisk,
    twoNumberWithSlash,
    weekday
  ]);

  const extractors = Object.create(null);
  const regToKey = (reg: RegExp): string => reg.source;

  extractors[regToKey(twoDigital)] = (str: string) => {
    const result = twoDigital.exec(str);
    if (result) {
      const [, value] = result;
      return {
        type: LITERAL,
        value: toInt(value)
      };
    }
    return null;
  };

  extractors[regToKey(threeDigital)] = (str: string) => {
    const result = threeDigital.exec(str);
    if (result) {
      const [, value] = result;
      return {
        type: LITERAL,
        value: toInt(value)
      };
    }
    return null;
  };

  extractors[regToKey(numberRange)] = (str: string) => {
    const result = numberRange.exec(str);
    if (result) {
      const [, from, to] = result;
      return {
        type: RANGE,
        value: {
          from: toInt(from),
          to: toInt(to)
        }
      };
    }
    return null;
  };

  extractors[regToKey(asterisk)] = (str: string) => {
    const result = asterisk.exec(str);
    if (result) {
      const [, , value] = result;
      if (value)
        return {
          type: EVERY,
          value: toInt(value)
        };
      return {
        type: EVERY,
        value: 1
      };
    }
  };

  extractors[regToKey(oneWithSlash)] = (str: string) => {
    const result = oneWithSlash.exec(str);
    if (result) {
      const [, from, value] = result;
      return [
        { type: EVERY, value: toInt(value) },
        {
          type: RANGE,
          value: {
            from: toInt(from)
          }
        }
      ];
    }
  };

  extractors[regToKey(twoNumberWithSlash)] = (str: string) => {
    const result = twoNumberWithSlash.exec(str);
    if (result) {
      const [, from, to, value] = result;
      return [
        { type: EVERY, value: toInt(value) },
        {
          type: RANGE,
          value: {
            from: toInt(from),
            to: toInt(to)
          }
        }
      ];
    }

    return [];
  };

  extractors[regToKey(weekday)] = (str: string) => {
    const nextStr = capitalizeAndSlice(str);
    const result = weekday.exec(nextStr);
    if (result) {
      const [, from, to] = result;

      if (to)
        return {
          type: RANGE,
          value: {
            from: weekdayToNumber(from),
            to: weekdayToNumber(to)
          }
        };
      return {
        type: LITERAL,
        value: weekdayToNumber(from)
      };
    }
  };

  extractors[regToKey(month)] = (str: string) => {
    const nextStr = capitalizeAndSlice(str);
    const result = month.exec(nextStr);
    if (result) {
      const [, from, to] = result;

      if (to)
        return {
          type: RANGE,
          value: {
            from: monthToNumber(from),
            to: monthToNumber(to)
          }
        };
      return {
        type: LITERAL,
        value: monthToNumber(from)
      };
    }
  };

  type numberValue = number;
  type rangeValue = {
    from?: number;
    to?: number | assignFn;
  };
  type ILiteral = { type: "literal"; value: numberValue };
  type IEvery = { type: "every"; value: numberValue };
  type IRange = { type: "range"; value: rangeValue };
  type parseResult = ILiteral | IEvery | IRange;
  type IParse = Array<parseResult>;

  const normalizeValue = (
    max: number,
    min: number,
    value: numberValue
  ): numberValue => {
    if (value > max) return max;
    if (value < min) return min;
    return value;
  };

  const normalizeRangeValue = (
    max: number,
    min: number,
    value: rangeValue
  ): rangeValue => {
    const { from, to } = value;

    const nextFrom = normalizeValue(max, min, <number>from);
    const nextTo = normalizeValue(max, min, <number>to);

    return {
      from: nextFrom,
      to: nextTo
    };
  };

  const runValueRangeConstraint = (unit: unitType) => {
    return (actions: IParse): IParse => {
      const instance: Unit = Unit.getInstance(unit);
      const { max, min } = instance;

      if (isNumber(max) && isNumber(min)) {
        return actions.map((action: parseResult): parseResult => {
          switch (action.type) {
            case LITERAL:
              return {
                ...action,
                value: normalizeValue(max, min, action.value)
              };
            case RANGE:
              return {
                ...action,
                value: normalizeRangeValue(max, min, action.value)
              };
            case EVERY:
              return { ...action };
          }
        });
      }

      return actions;
    };
  };

  const normalizeWeekdayValue = (actions: IParse): IParse => {
    return actions.map(action => {
      switch (action.type) {
        case LITERAL:
          const literalValue = action.value;
          return { ...action, value: literalValue === 0 ? 7 : literalValue };
        case RANGE:
          const rangeValue = action.value;
          if (rangeValue.from === 0 && rangeValue.to === 6) {
            return { ...action, value: { from: 1, to: 7 } };
          }
          return { ...action };
        case EVERY:
          return { ...action };
      }
    });
  };

  const postProcess = Object.create(null);
  postProcess.milliSecond = conbineWithProceed([
    runValueRangeConstraint("milliSecond")
  ]);
  postProcess.second = conbineWithProceed([runValueRangeConstraint("second")]);
  postProcess.minute = conbineWithProceed([runValueRangeConstraint("minute")]);
  postProcess.hour = conbineWithProceed([runValueRangeConstraint("hour")]);
  postProcess.month = conbineWithProceed([runValueRangeConstraint("month")]);

  // normalizeWeekdayValue` should run first. It should process origin value with `0-6`
  postProcess.weekday = conbineWithProceed([
    normalizeWeekdayValue,
    runValueRangeConstraint("weekday")
  ]);

  function parse(pattern: string, unit: unitType): IParse {
    const arr = pattern.split(",");

    return arr.reduce((mergedValue, cur) => {
      const pattern = patterns[unit];
      let nextCur = cur;

      if (preProcess[unit]) {
        nextCur = preProcess[unit](cur);
      }

      let result = pattern(nextCur);

      if (postProcess[unit]) {
        result = postProcess[unit]([].concat(result));
      }

      return mergedValue.concat(result);
    }, []);
  }

  // ------------------- units ------------------------//
  const units: unitTypes = [
    "milliSecond",
    "second",
    "minute",
    "hour",
    "day",
    "month",
    "weekday"
  ];

  type timeType = "milliSecond" | "second" | "minute" | "hour";
  type dateType = "day" | "month" | "weekday";
  type unitType = timeType | dateType;
  type unitTypes = Array<unitType>;
  type timeTypes = Array<timeType>;
  type dateTypes = Array<dateType>;

  const nonLeapLadder = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const leapLadder = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let singletonInstance = Object.create(null);
  const unitBase = 1000;

  type assignFn = (
    opt: {
      month?: number;
      year?: number;
    }
  ) => number;

  interface IUnit {
    unit: unitType;
    value: number;
    max: number | assignFn;
    min: number;
    order: number;
    step: number;
    setCallee: string;
    affiliatedMax?: assignFn;
  }

  class Unit {
    public unit: unitType;
    public value: number;
    public max: number | assignFn;
    public min: number;
    public order: number;
    public step: number;
    public setCallee: string;
    public affiliatedMax?: assignFn;

    constructor(opts: IUnit) {
      const {
        unit,
        value,
        step,
        max,
        min,
        order,
        setCallee,
        affiliatedMax
      } = opts;

      this.unit = unit;
      this.value = value;
      this.max = max;
      this.min = min;
      this.order = order;
      this.step = step;
      this.setCallee = setCallee;
      this.affiliatedMax = affiliatedMax;
    }

    static instance(unit: unitType): Unit {
      return Unit.create(unit);
    }

    static create(unit: unitType): Unit {
      return Unit.getInstance(unit);
    }

    static getDayMax({ month, year }: { month: number; year: number }): number {
      return isLeap(year) ? leapLadder[month] : nonLeapLadder[month];
    }

    static getInstance(unit: unitType): Unit {
      if (!singletonInstance[unit]) {
        const defaultProps = {
          unit,
          order: units.indexOf(unit) + 1
        };

        let props: any = undefined;

        switch (unit) {
          case "milliSecond":
            props = {
              min: 0,
              max: 999,
              step: 1,
              value: 1,
              setCallee: "setMilliseconds"
            };
            break;
          case "second":
            props = {
              min: 0,
              max: 59,
              step: 1 * unitBase,
              value: 1 * unitBase,
              setCallee: "setSeconds"
            };
            break;
          case "minute":
            props = {
              min: 0,
              max: 59,
              step: 60 * unitBase,
              value: 60 * unitBase,
              setCallee: "setMinutes"
            };
            break;
          case "hour":
            props = {
              min: 0,
              max: 23,
              step: 60 * 60 * unitBase,
              value: 60 * 60 * unitBase,
              setCallee: "setHours"
            };
            break;
          case "day":
            props = {
              min: 1,
              max: Unit.getDayMax,
              step: 24 * 3600 * unitBase,
              value: 24 * 3600 * unitBase,
              setCallee: "setDate"
            };
            break;
          case "weekday":
            props = {
              min: 1,
              max: 7,
              affiliatedMax: Unit.getDayMax,
              step: 24 * 3600 * unitBase,
              value: undefined,
              setCallee: "setDate"
            };
            break;
          case "month":
            props = {
              min: 0,
              max: 11,
              step: 24 * 3600 * unitBase,
              value: undefined,
              setCallee: "setMonth"
            };
            break;
        }

        singletonInstance[unit] = new Unit(Object.assign(
          {},
          props,
          defaultProps
        ) as IUnit);
        // } as IUnit);
      }

      return singletonInstance[unit];
    }
  }

  // -------------------- token ----------------------- //
  interface IToken {
    resolvedOptions(): Unit;
    matchToken(data: number, dateInfo?: IDateInfo): boolean;
    formatToParts(): IParse;
  }

  class Token implements IToken {
    public pattern: string;
    public unit: unitType;
    public resolvedOptionsCache: Unit;
    public formatToPartsCache: IParse;

    constructor(pattern: string, unit: unitType) {
      this.pattern = pattern;
      this.unit = unit;
    }

    static create(pattern: string, unit: unitType): Token {
      return new Token(pattern, unit);
    }

    public resolvedOptions(): Unit {
      const ret = {};
      if (!this.resolvedOptionsCache) {
        this.resolvedOptionsCache = Unit.instance(this.unit);
      }

      return this.resolvedOptionsCache;
    }

    public matchToken(data: number, dateInfo?: IDateInfo): boolean {
      const parts = this.formatToParts();

      const literalParts: Array<ILiteral> = parts.filter(
        (part): part is ILiteral => part.type === LITERAL
      );
      const everyParts: Array<IEvery> = parts.filter(
        (part): part is IEvery => part.type === EVERY
      );
      let rangeParts: Array<IRange> = parts.filter(
        (part): part is IRange => part.type === RANGE
      );

      for (let i of literalParts) {
        const { value } = i;
        if (value === data) return true;
      }

      let step = 1;

      if (everyParts.length > 0) {
        step = everyParts[0].value;
      }

      // pending to calculate day count
      const { min, max } = this.resolvedOptions();
      let nextMax = max;

      if (typeof max === "function" && dateInfo)
        nextMax = (max as assignFn)(dateInfo);

      // only if has type 'EVERY' will provide defualt rangeParts;
      if (rangeParts.length === 0 && everyParts.length > 0) {
        rangeParts = [
          {
            type: RANGE,
            value: { from: min, to: nextMax }
          }
        ];
      }

      for (let i of rangeParts) {
        const from = i.value.from || min;
        const to = i.value.to || nextMax;

        for (let i = from; i <= to; i = i + step) {
          if (data === i) return true;
        }
      }

      return false;
    }

    /**
     * value should be included
     * Because the `max` value of `month` should be determined by `year` and `month`;
     * there is a need of `ts` param;
     */
    public findTheClosestValidValue(value: number, ts: Date) {
      const { max, min } = this.resolvedOptions();
      const info = resolveTsParts(ts);

      let nextMax = max;
      if (typeof nextMax === "function") {
        const year = ts.getFullYear();
        const month = ts.getMonth();
        nextMax = nextMax(info);
      }

      for (let i = value; i >= min && i <= nextMax; i++) {
        if (this.matchToken(i, info)) {
          return i;
        }
      }

      throw new Error(
        "Maybe you should carry over the number, then match again"
      );
    }

    public findTheClosestValidValueForWeekday(value: number, ts: Date) {
      const { affiliatedMax, min } = this.resolvedOptions();
      const info = resolveTsParts(ts);
      const clone = new Date(toNum(ts));

      if (!affiliatedMax) return;

      const year = ts.getFullYear();
      const month = ts.getMonth();
      const nextMax = affiliatedMax(info);

      for (let i = value; i >= min && i <= nextMax; ) {
        const { weekday } = resolveTsParts(clone);
        if (this.matchToken(weekday, info)) {
          return i;
        }

        i++;
        clone.setDate(i);
      }

      throw new Error(
        "Maybe you should carry over the number, then match again"
      );
    }

    public formatToParts(): IParse {
      if (!this.formatToPartsCache)
        this.formatToPartsCache = parse(this.pattern, this.unit);
      return this.formatToPartsCache;
    }
  }

  // --------------------- Pattern.ts ------------------//
  const MILLISECOND_BASED = Symbol("millisecond_base");
  const SECOND_BASED = Symbol("second_based");
  const MINUTE_BASED = Symbol("minute_base");

  class Pattern {
    public milliSecondToken: Token;
    public secondToken: Token;
    public minuteToken: Token;
    public hourToken: Token;
    public dayToken: Token;
    public monthToken: Token;
    public weekdayToken: Token;

    private pattern: string;

    [k: string]: any;

    constructor(pattern: string) {
      this.milliSecondToken = Object.create(null);
      this.secondToken = Object.create(null);
      this.minuteToken = Object.create(null);
      this.hourToken = Object.create(null);
      this.dayToken = Object.create(null);
      this.monthToken = Object.create(null);
      this.weekdayToken = Object.create(null);

      this.pattern = pattern;
      this.type = MILLISECOND_BASED;
    }

    static create(pattern: string): Pattern {
      const instance = new Pattern(pattern);
      instance.initToken();
      return instance;
    }

    private patternParts(): Array<string> {
      return this.pattern.split(" ");
    }

    /**
     * The first one which is not `*` will determine the next timestamp's plus step.
     */
    public resolveStep(): number {
      const len = this.fullPatternParts.length;

      let i = 0;

      for (; i < len; i++) {
        if (this.fullPatternParts[i] !== "*") {
          break;
        }
      }

      if (i !== len) {
        const options = this[`${units[i]}Token`].resolvedOptions();
        return options.step;
      }

      switch (this.type) {
        case MILLISECOND_BASED:
          return 1;
        case SECOND_BASED:
          return 1 * 1000;
        case MINUTE_BASED:
          return 1 * 60 * 1000;
        default:
          return 1;
      }
    }

    private initToken(): void {
      let parts: Array<string> = this.patternParts();

      const len = parts.length;

      if (len < 5 || len > 7) throw new Error("Invalid pattern");
      if (len === 5) {
        parts = ["*", "*"].concat(parts);
        this.type = MINUTE_BASED;
      }
      if (len === 6) {
        parts = ["*"].concat(parts);
        this.type = SECOND_BASED;
      }

      this.fullPatternParts = parts;

      parts.forEach(
        (part, i) => (this[`${units[i]}Token`] = Token.create(part, units[i]))
      );
    }
  }

  // ---------------------- Resolver.ts -------------- //
  interface ResolverConstructor {
    pattern: string;
    ts?: Date;
  }

  type Index =
    | "milliSecondToken"
    | "secondToken"
    | "minuteToken"
    | "hourToken"
    | "dayToken"
    | "monthToken";
  type indexSignature = { [k in Index]?: number };

  interface withCallee {
    [k: string]: any;
  }

  class DateWithSignature extends Date {
    [k: string]: any;
  }

  class Resolver {
    public pattern: Pattern;
    public milliSecondToken: Token;
    public secondToken: Token;
    public minuteToken: Token;
    public hourToken: Token;
    public dayToken: Token;
    public monthToken: Token;
    public weekdayToken: Token;

    public originTs: Date;
    public prevTs: Date;
    public ts: Date;
    public nextTs?: Date;
    [k: string]: any;

    constructor(opts: ResolverConstructor) {
      const { pattern, ts } = opts;
      const patternInstance: Pattern = Pattern.create(pattern);

      const {
        milliSecondToken,
        secondToken,
        minuteToken,
        hourToken,
        dayToken,
        monthToken,
        weekdayToken
      } = patternInstance;

      this.pattern = patternInstance;

      this.milliSecondToken = milliSecondToken;
      this.secondToken = secondToken;
      this.minuteToken = minuteToken;
      this.hourToken = hourToken;
      this.dayToken = dayToken;
      this.monthToken = monthToken;
      this.weekdayToken = weekdayToken;

      // `originTs` served as the base ts; It aims to calculate to nextTs's offset.
      this.originTs = ts || new Date();
      // plus one millisecond
      // this.ts = new Date(toNum(this.originTs) + 1);
      this.ts = new Date(toNum(this.originTs));
      this.nextTs = undefined;
    }

    public [Symbol.iterator]() {
      return {
        next: () => {
          this.prevTs = new Date(toNum(this.ts));
          const nextTime = this.nextTimeToCall();
          const step = this.pattern.resolveStep();

          this.ts = new Date(toNum(nextTime) + step);
          return {
            value: nextTime,
            done: false
          };
        }
      };
    }

    /**
     * Accroding to the time pattern and this.ts to calculate the nextTime
     * abide to the `cron time pattern`
     */
    public nextTimeToCall(): Date {
      const len = units.length;
      this.traverse(units[len - 2], this.ts);
      return this.ts;
    }

    private normalizeTsValueAfterUnit(
      unit: unitType,
      ts: DateWithSignature,
      inclusive?: boolean
    ) {
      const index = units.indexOf(unit);
      let max = index;

      if (inclusive) {
        max = index + 1;
      }

      for (let i = 0; i < max; i++) {
        const unit = units[i];
        const token = this.getTokenByUnit(unit);
        const options = token.resolvedOptions();
        const { setCallee, min } = options;
        ts[setCallee](min);
      }
    }

    private decorateTsWithClosestValidValueAfterUnit(
      unit: unitType,
      ts: DateWithSignature,
      inclusive?: boolean
    ) {
      const index = units.indexOf(unit);
      let max = index;

      if (inclusive) {
        max = index + 1;
      }

      for (let i = 0; i < max; i++) {
        const unit = units[i];
        const token = this.getTokenByUnit(unit);
        const value = resolveTsParts(ts)[unit];
        const newValue = token.findTheClosestValidValue(value, ts);
        const options = token.resolvedOptions();
        const { setCallee } = options;
        ts[setCallee](newValue);
      }
    }

    private traverse(unit: unitType, ts: DateWithSignature) {
      const index = units.indexOf(unit);
      const token = this.getTokenByUnit(unit);
      const info = resolveTsParts(ts);
      const value = info[unit];

      if (!this.checkIfTokenMatchsValue(token, value, info)) {
        try {
          const validValue = this.findTokenClosestValidValue(token, value, ts);
          const { setCallee } = token.resolvedOptions();
          ts[setCallee](validValue);
          this.normalizeTsValueAfterUnit(unit, ts);
          this.decorateTsWithClosestValidValueAfterUnit(unit, ts);
          return;
        } catch (err) {
          if (unit !== "month") {
            const parentUnit = units[index + 1];
            const parentToken = this.getTokenByUnit(parentUnit);
            const { setCallee } = parentToken.resolvedOptions();
            const parentValue = info[parentUnit];
            ts[setCallee](parentValue + 1);
            this.normalizeTsValueAfterUnit(parentUnit, ts);
            this.traverse(parentUnit, ts);
          } else {
            const year = ts.getFullYear();
            ts.setFullYear(year + 1);
            this.normalizeTsValueAfterUnit(unit, ts, true);
            this.decorateTsWithClosestValidValueAfterUnit(unit, ts, true);
          }
          return;
        }
      }
      if (index > 0) {
        this.traverse(units[index - 1], ts);
      }
    }

    private checkIfTokenMatchsValue(
      token: Token,
      value: number,
      info: IDateInfo
    ) {
      const unit = token.unit;
      if (unit !== "day") {
        return token.matchToken(value, info);
      }

      const weekdayToken = this.getTokenByUnit("weekday");
      const dayPattern = token.pattern;
      const weekdayPattern = weekdayToken.pattern;

      if (weekdayPattern === "*" && dayPattern === "*") return true;

      const dayMatch = token.matchToken(value, info);
      const weekdayMatch = weekdayToken.matchToken(info.weekday, info);
      if (weekdayPattern === "*" && dayPattern !== "*") return dayMatch;
      if (weekdayPattern !== "*" && dayPattern === "*") return weekdayMatch;
      return dayMatch || weekdayMatch;
    }

    private findTokenClosestValidValue(
      token: Token,
      value: number,
      ts: DateWithSignature
    ) {
      const unit = token.unit;

      if (unit !== "day") {
        return token.findTheClosestValidValue(value, ts);
      }

      const info = resolveTsParts(ts);

      const weekdayToken = this.getTokenByUnit("weekday");
      const dayPattern = token.pattern;
      const weekdayPattern = weekdayToken.pattern;
      if (weekdayPattern === "*" && dayPattern === "*") return value;

      const dayMatch = token.matchToken(value, info);
      const weekdayMatch = weekdayToken.matchToken(info.weekday, info);

      let valueFromDayUnit = undefined;
      let valueFromWeekdayUnit = undefined;

      try {
        valueFromDayUnit = token.findTheClosestValidValue(value, ts);
      } catch (err) {
        if (weekdayPattern === "*" && dayPattern !== "*") throw err;
      }

      if (weekdayPattern === "*" && dayPattern !== "*") return valueFromDayUnit;

      try {
        valueFromWeekdayUnit = weekdayToken.findTheClosestValidValueForWeekday(
          value,
          ts
        );
      } catch (err) {
        if (weekdayPattern !== "*" && dayPattern === "*") throw err;
      }

      if (weekdayPattern !== "*" && dayPattern === "*")
        return valueFromWeekdayUnit;

      if (valueFromDayUnit && valueFromWeekdayUnit) {
        return Math.min(valueFromDayUnit, valueFromWeekdayUnit);
      }

      throw new Error("Carry over to fetch again");
    }

    private getTokenByUnit(unit: unitType): Token {
      return this[`${unit}Token`];
    }
  }

  // ------------------------ CronrCounter.ts ------------------- //
  interface CronrCounterConstructorProps {
    name: string;
    pattern: string;
    ts?: Date;
  }

  class CronrCounter {
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

  // --------------------- Cronr.ts ------------------------ //
  type fn = () => {};
  const INITIAL = "initial";
  const RUNNING = "running";
  const SUSPEND = "suspend";
  const CLEAR = "clear";
  type IStatus = "initial" | "running" | "suspend" | "clear";

  interface IOptions {
    immediate: boolean;
    startTime: Date;
    endTime?: Date;
  }

  return class Cronr {
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
        const nextTick = this.iterator.next().value;

        if (!this.endTime || this.endTime > nextTick) {
          const timeout = toNum(nextTick) - toNum(new Date());
          this.nextTick = nextTick;
          this.timeoutId = setTimeout(callback, timeout);
        }
        this.cb.call(this);
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
  };
};
