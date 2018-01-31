const min = (arr) => {
  return arr.reduce((prev, cur) => {
    if (cur) return typeof prev !== 'undefined' ? Math.min(prev, cur): cur;
    return prev;
  })

  return;
};

export default min;
