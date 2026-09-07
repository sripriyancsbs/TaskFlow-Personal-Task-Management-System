/**
 * 404 Not Found Middleware
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Endpoint '${req.method} ${req.originalUrl}' does not exist.`,
  });
}

/**
 * Centralized Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  // Log error internally for debugging without exposing to client
  console.error('[API Error]:', err.message);

  // PostgreSQL check constraint or validation violation
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      error: 'Data validation failed against database constraints.',
    });
  }

  // PostgreSQL syntax / query failure
  const statusCode = err.statusCode || (err.status >= 400 && err.status < 600 ? err.status : 500);

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'An unexpected internal server error occurred.' : err.message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
