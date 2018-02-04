// type arbitrary = {
//   [propName: string]: any;
// }

// type Partial<T> = {
//   [P in keyof T]?: T[P];
// };

// function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
//   return keys.reduce((prev, key) => {
//     if (obj[key]) return { ...prev, [key]: obj[key]};
//     return prev;
//   }, {});
// }

// works
// function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> | {} {
//   return keys.reduce((prev, key) => {
//     if (obj[key]) return { ...prev, [key]: obj[key]};
//     return prev;
//   }, {});
// }

// type K = "id" | "pattern" | ;
type K = string;

type opts = Array<K>;

// declare function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K>;

// type Partial <T, K> = {
//   [P in opts]?: T[P];
// }

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {

  const copy: any = {}
  keys.forEach(k => {
    copy[k] = obj[k]
  })
  return copy

  // const ret = keys.reduce((prev, key) => {
  //   if (obj[key]) return { ...prev, [key]: obj[key]};
  //   return prev;
  // }, {});

  // return ret;
}

// function pick (obj, keys) {
//   return keys.reduce((prev, key) => {
//     if (obj[key]) return { ...prev, [key]: obj[key]};
//     return prev;
//   }, {});
// };

export default pick;

// const pick = <A, T>(obj: arbitrary, keys: Array<string>): {} => {
//   return keys.reduce((prev, key) => {
//     if (obj[key]) return { ...prev, [key]: obj[key]};
//     return prev;
//   }, {});
// };

// export default pick;
