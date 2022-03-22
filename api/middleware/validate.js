const { validationResult } = require("express-validator");
const { errorToMessage} = require("../errors")

const validateMiddleware = async (req, res, next) => {
  try {
    validationResult(req).throw();
  } catch (err) {
    const errors = errorToMessage(Object.values(err.mapped()))
    return res.status(400).json({errors});
  }
  return next();
};

module.exports = validateMiddleware
