const connectionError = {
  type: "PLUGIN_UNHEALTHY",
  message: "the service is down",
};

const errorMap = {
  EAI_AGAIN: connectionError,
};

const checkPydanticValidation = ({ loc, msg }) => {
  if (loc !== undefined && msg !== undefined) {
    return {
      type: "INNER_VALIDATION_ERROR",
      message: `${loc[1]}: ${msg}`,
    };
  }
  return undefined;
};

const checkJavascriptValidation = ({ param, msg }) => {
  if (param !== undefined && msg !== undefined) {
    return {
      type: "OUTER_VALIDATION_ERROR",
      message: `${param}: ${msg}`,
    };
  }
  return undefined;
};

const checkErrorMap = (rawError) => {
  if (typeof rawError === "string") {
    const error = errorMap[rawError];
    if (error !== undefined) return error;
  }
  return undefined;
};
const messageError = ({ message }) => {
  if (message !== undefined) return { type: "MESSAGE_ERROR", message };
  return undefined;
};

const singleErrorToMessage = (rawError, returnNullOnFail=false) => {
  for (const errorFunc of [
    checkPydanticValidation,
    checkJavascriptValidation,
    messageError,
    checkErrorMap,
  ]) {
    const error = errorFunc(rawError);
    if (error) return error;
  }
  if (returnNullOnFail) return null
  return {
    type: "UNKNOWN",
    message: JSON.stringify(rawError),
  };
};

const errorToMessage = (error, returnNullOnFail=false) => {
  let errors
  if (Array.isArray(error)) errors = error.map((e) => singleErrorToMessage(e, returnNullOnFail));
  errors = [singleErrorToMessage(error, returnNullOnFail)];
  if (returnNullOnFail && errors.some(e => !e)) return null
  return errors
};

module.exports = { errorToMessage };
