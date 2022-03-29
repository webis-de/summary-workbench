const axios = require("axios");
const { errorToMessage } = require("./errors");


const validationRequest = async (plugins) => {
  const results = await Promise.all(
    Object.entries(plugins).map(async ([key, { url, args }]) => {
      try {
        await axios.post(`${url}/validate`, { ...args });
        return undefined;
      } catch (error) {
        let errors = null;
        const { code } = error;
        if (code) errors = errorToMessage(code);
        else errors = errorToMessage(error.response.data);
        return [key, { errors }];
      }
    })
  );
  return Object.fromEntries(results.filter((item) => item !== undefined));
};

const pluginRequest = async (plugins, extractor) => {
  const results = await Promise.all(
    Object.entries(plugins).map(async ([key, { url, args }]) => {
      try {
        const response = await axios.post(url, { ...args });
        return [key, extractor(response.data)];
      } catch (error) {
        let errors = null;
        const { code } = error;
        if (code) errors = errorToMessage(code);
        else errors = errorToMessage(error.response.data);
        return [key, { errors }];
      }
    })
  );
  return Object.fromEntries(results);
};

module.exports = { pluginRequest, validationRequest };
