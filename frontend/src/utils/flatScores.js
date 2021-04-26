const flatten = (scores, metrics) => {
  const flatScores = [];
  Object.entries(scores).forEach(([metric, value]) => {
    const { readable } = metrics[metric]
    if (typeof value === "number") flatScores.push([readable, value]);
    else
      Object.entries(value).forEach(([suffix, score]) =>
        flatScores.push([`${readable} ${suffix}`, score])
      );
  });
  flatScores.sort();
  return flatScores;
};

export { flatten }
