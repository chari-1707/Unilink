function notFoundHandler(req, res, _next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || err.status || 500;
  const message = status >= 500 ? "Internal server error" : err.message || "Request failed";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== "production" ? { details: err.details } : {}),
  });
}

module.exports = { notFoundHandler, errorHandler };

