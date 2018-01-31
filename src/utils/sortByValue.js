const sortByValue = (a, b) => {
  const { value: va } = a;
  const { value: vb } = b;

  return va - vb;
};

export default sortByValue;
