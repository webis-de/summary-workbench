const getChosen = (models) =>
  Object.fromEntries(Object.entries(models).filter(([, { isSet }]) => isSet));

const mapObject = (obj, func) =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, func(value)]));

const foldObject = (objects, func, values = []) => {
  if (!objects.length) return func(values);
  const [obj, ...rest] = objects;
  return mapObject(obj, (value) => foldObject(rest, func, [...values, value]));
};

const unpack = (obj, subKey) => mapObject(obj, (value) => value[subKey]);

export { getChosen, unpack, mapObject, foldObject };
