const min = (arr: Array<number>) => {
  return arr.reduce((prev, cur) => {
    if (cur) return typeof prev !== 'undefined' ? Math.min(prev, cur): cur;
    return prev;
  })
};

export default min;
