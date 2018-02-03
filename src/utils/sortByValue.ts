type withValue = {
  value: any;
}

const sortByValue = (a: withValue, b: withValue): number => {
  const { value: va } = a;
  const { value: vb } = b;

  return va - vb;
};

export default sortByValue;
