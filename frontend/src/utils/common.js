const getChosen = (models) =>
  Object.fromEntries(Object.entries(models).filter(([, { isSet }]) => isSet));

const mapObject = (obj, func) =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, func(value, key)]));

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

const extractArgumentErrors = (chosenModels, models) =>
  chosenModels
    .map((key) => {
      const {
        info: { name },
        arguments: args,
      } = models[key];
      return {
        name,
        errors: Object.keys(filterObject(args, (_, v) => v === undefined)).map(
          (k) => `${k}: argument is missing`
        ),
      };
    })
    .filter(({ errors: e }) => e.length)
    .sort(({ name }) => name);

const splitSentences = (text) => text.match(/[^.?!]+[.!?]+[\])'"`’”]*|.+/g).map(t => t.trim());

const paragraphSize = 1;
const computeParagraphs = (text) => {
  const paragraphs = [];
  for (let index = 0; index < text.length; index += paragraphSize) {
    const paragraph = text.slice(index, index + paragraphSize);
    paragraphs.push(paragraph.join(" "));
  }
  return paragraphs.join("\n\n");
};

export {
  getChosen,
  unpack,
  mapObject,
  filterObject,
  foldObject,
  sum,
  average,
  arrayEqual,
  extractArgumentErrors,
  splitSentences,
  computeParagraphs,
};
