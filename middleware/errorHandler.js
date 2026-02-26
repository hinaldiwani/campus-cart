/**
 * middleware/errorHandler.js
 * Global Express error-handling middleware.
 * Must be the LAST middleware registered in server.js.
 */

const { validationResult } = require("express-validator");

/** Call this inside route handlers to collect express-validator errors */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed.",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

/** Catch-all 404 */
function notFound(req, res, next) {
  const err = new Error(`Route not found — ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

/** Global error handler */
function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV === "development";

  // MySQL duplicate entry
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "A record with this value already exists.",
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error.",
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = { validate, notFound, errorHandler };
