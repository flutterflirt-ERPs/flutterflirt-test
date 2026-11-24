const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    const errorDetails = err.errors ? err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') : 'Invalid input';
    return res.status(400).json({
      success: false,
      message: errorDetails || "Validation Error",
      errors: err.errors
    });
  }
};
module.exports = validate;
