const getChosen = (models) =>
  Object.fromEntries(Object.entries(models).filter(([, { isSet }]) => isSet));

const unpack = (obj, subKey) =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, value[subKey]]));

export { getChosen, unpack };
