const flatten = (scores, metrics) => {
  const flatScores = [];
  Object.entries(scores).forEach(([metric, value]) => {
    const { name } = metrics[metric].info
    if (typeof value === "number") flatScores.push([name, value]);
    else
      Object.entries(value).forEach(([suffix, score]) =>
        flatScores.push([`${name} ${suffix}`, score])
      );
  });
  flatScores.sort();
  return flatScores;
};

export { flatten }
