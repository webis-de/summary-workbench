const flatten = (scores, metrics) => {
  const flatScores = [];
  Object.entries(scores).forEach(([metric, value]) => {
    const { name } = metrics[metric].info
    if (typeof value === "number") throw new Error (`the metric '${name}' returned a number but list of number is expected`)
    if (Array.isArray(value)) flatScores.push([name, value]);
    else
      Object.entries(value).forEach(([suffix, score]) =>
        flatScores.push([`${name} ${suffix}`, score])
      );
  });
  flatScores.sort();
  return flatScores;
};

export { flatten }
