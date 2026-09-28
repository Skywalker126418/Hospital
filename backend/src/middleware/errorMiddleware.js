const config = require('../config/environment');

/**
 * 404 Route Handler
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Global Centralized Error Handler
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Global Error]:', err);

  // Handle MySQL errors gracefully
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A record with duplicate unique information already exists.',
      error: config.nodeEnv === 'development' ? err.message : undefined,
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({
      success: false,
      message: 'Invalid foreign key reference: Associated entity does not exist.',
      error: config.nodeEnv === 'development' ? err.message : undefined,
    });
  }

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error. Please try again later.',
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
