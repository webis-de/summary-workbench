const collectPluginErrors = (plugins, elementFunc, dataFunc) => {
  const collectedElements = [];
  const collectedErrors = [];
  Object.entries(plugins).forEach(([name, { errors, ...other }]) => {
    const element = elementFunc(name, other);
    if (element) collectedElements.push(element);
    if (errors) collectedErrors.push({ name, errors });
  });
  collectedElements.sort((a, b) => a.name > b.name);
  collectedErrors.sort((a, b) => a.name > b.name);
  const data = {};
  if (collectedElements.length) data.data = dataFunc(collectedElements);
  if (collectedErrors.length) data.errors = collectedErrors;
  return data;
};

const mapErrorsToName = (errors, definitions) =>
  errors.map(({ name, ...rest }) => {
    let obj = definitions[name];
    if (obj) obj = obj.info;
    if (obj) obj = obj.name;
    return { name: obj || name, ...rest };
  });

export { collectPluginErrors, mapErrorsToName };
