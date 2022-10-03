const getChosen = (models) =>
  Object.fromEntries(Object.entries(models).filter(([, { isSet }]) => isSet));

const omap = (obj, func, kind = "value") => {
  switch (kind) {
    case "value":
      return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, func(value, key)]));
    case "full":
      return Object.fromEntries(Object.entries(obj).map(([key, value]) => func(key, value)));
    case "key":
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [func(key, value), value])
      );
    default:
      throw new Error(`unknown kind ${kind}`);
  }
};

const ofilter = (obj, func) =>
  Object.fromEntries(Object.entries(obj).filter(([key, value]) => func(key, value)));

const foldObject = (objects, func, values = []) => {
  if (!objects.length) return func(values);
  const [obj, ...rest] = objects;
  return omap(obj, (value) => foldObject(rest, func, [...values, value]));
};

const unpack = (obj, subKey) => omap(obj, (value) => value[subKey]);

const sum = (arr) => arr.reduce((acc, value) => acc + value, 0);

const average = (arr) => sum(arr) / arr.length;

const arrayEqual = (a, b) => a.length === b.length && a.every((val, index) => val === b[index]);

const splitSentences = (text) => text.match(/[^.?!]+[.!?]+[\])'"`’”]*|.+/g).map((t) => t.trim());

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
  omap,
  ofilter,
  foldObject,
  sum,
  average,
  arrayEqual,
  splitSentences,
  computeParagraphs,
};
