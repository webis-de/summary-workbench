const axios = require("axios");
const { errorToMessage } = require("./errors");

const validationRequest = async (plugins, abortController) => {
  const results = await Promise.all(
    Object.entries(plugins).map(async ([key, { url, args }]) => {
      try {
        await axios.post(`${url}/validate`, args, { signal: abortController.signal });
        return undefined;
      } catch (error) {
        if (error instanceof axios.CanceledError) return null
        let errors = null;
        const { code } = error;
        if (code) errors = errorToMessage(code);
        else errors = errorToMessage(error.response.data);
        return [key, { errors }];
      }
    })
  );
  if (abortController.signal.aborted) return
  return Object.fromEntries(results.filter((item) => item !== undefined));
};

const pluginRequest = async (plugins, extractor, abortController) => {
  const results = await Promise.all(
    Object.entries(plugins).map(async ([key, { url, args }]) => {
      try {
        const response = await axios.post(url, args, { signal: abortController.signal });
        return [key, extractor(response.data)];
      } catch (error) {
        if (error instanceof axios.CanceledError) return null
        let errors = null;
        const { code } = error;
        if (code) errors = errorToMessage(code);
        else errors = errorToMessage(error.response.data);
        return [key, { errors }];
      }
    })
  );
  if (abortController.signal.aborted) return
  return Object.fromEntries(results);
};

module.exports = { pluginRequest, validationRequest };
