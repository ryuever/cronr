function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  return keys.reduce((prev, key) => {
    if (obj[key]) return { ...prev, [key]: obj[key]};
    return prev;
  }, {} as any);
}

export default pick;
