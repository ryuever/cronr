const pick = (obj, keys) => {
  return keys.reduce((prev, key) => {
    if (obj[key]) return { ...prev, [key]: obj[key]};
    return prev;
  }, {});
};

export default pick;
