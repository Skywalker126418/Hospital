const { validationResult } = require('express-validator');

/**
 * Validates request inputs from express-validator schema
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please review and correct the highlighted fields.',
      errors: formattedErrors,
    });
  }
  next();
};

module.exports = {
  validate,
};
