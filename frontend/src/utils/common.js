const getChosen = (models) =>
  Object.fromEntries(Object.entries(models).filter(([, { isSet }]) => isSet));

const mapObject = (obj, func) =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, func(value)]));

const filterObject = (obj, func) =>
  Object.fromEntries(Object.entries(obj).filter(([key, value]) => func(key, value)));

const foldObject = (objects, func, values = []) => {
  if (!objects.length) return func(values);
  const [obj, ...rest] = objects;
  return mapObject(obj, (value) => foldObject(rest, func, [...values, value]));
};

const unpack = (obj, subKey) => mapObject(obj, (value) => value[subKey]);

const sum = (arr) => arr.reduce((acc, value) => acc + value, 0);

const average = (arr) => sum(arr) / arr.length;

const arrayEqual = (a, b) => a.length === b.length && a.every((val, index) => val === b[index]);

export { getChosen, unpack, mapObject, filterObject, foldObject, sum, average, arrayEqual };
