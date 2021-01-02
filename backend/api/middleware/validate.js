const validateMiddleware = async (req, res, next) => {
  try {
    validationResult(req).throw();
  } catch (err) {
    return res.status(400).json({ errors: err.mapped() });
  }
  next();
};

module.exports = validateMiddleware
