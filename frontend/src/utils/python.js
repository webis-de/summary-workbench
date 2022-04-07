const range = (count) => [...Array(count).keys()];
const zip = (...arrays) => {
  const count = Math.min(...arrays.map(({ length }) => length));
  return range(count).map((i) => arrays.map((array) => array[i]));
};

export { zip, range };
