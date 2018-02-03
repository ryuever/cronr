type arbitrary = {
  [propName: string]: any;
}

type Partial<T> = {
  [P in keyof T]?: T[P];
};

declare function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K>;
function pick <T, K extends keyof T>(obj, keys) {
  return keys.reduce((prev, key) => {
    if (obj[key]) return { ...prev, [key]: obj[key]};
    return prev;
  }, {});
};

export default pick;

// const pick = <A, T>(obj: arbitrary, keys: Array<string>): {} => {
//   return keys.reduce((prev, key) => {
//     if (obj[key]) return { ...prev, [key]: obj[key]};
//     return prev;
//   }, {});
// };

// export default pick;
