// Unit 5: Express Custom Middleware for Request Logging and Debugging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Hook into response finish event to calculate elapsed time
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    const statusColor =
      res.statusCode >= 500
        ? '\x1b[31m' // red
        : res.statusCode >= 400
        ? '\x1b[33m' // yellow
        : res.statusCode >= 300
        ? '\x1b[36m' // cyan
        : '\x1b[32m'; // green

    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} -> ${statusColor}${res.statusCode}\x1b[0m (${elapsed}ms)`
    );
  });

  next(); // Pass control to the next middleware in pipeline
};

module.exports = requestLogger;
