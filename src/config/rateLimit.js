const rateLimit = require('express-rate-limit');

// Helper to show minutes in error messages
const msToMinutes = (ms) => Math.ceil(ms / (60 * 1000));

function createLimiter(windowMs, max, error, message) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error,
        message,
        retryAfter: msToMinutes(windowMs)
      });
    }
  });
}

// General limiter for all routes
const globalLimiter = createLimiter(
  15 * 60 * 1000,  // 15 minutes
  300,              // 300 requests per 15 min
  'Too many requests',
  'Too many requests from this IP, please try again later.'
);

// API calls - moderate limits
const apiLimiter = createLimiter(
  60 * 1000,        // 1 minute
  100,              // 100 requests per minute
  'API rate limit exceeded',
  'Too many API requests. Please slow down.'
);

// Creating notifications - stricter
const notificationCreateLimiter = createLimiter(
  60 * 1000,        // 1 minute
  20,               // 20 creates per minute
  'Notification rate limit exceeded',
  'Too many notification creation requests. Please slow down.'
);

// Bulk operations - very strict
const bulkOperationLimiter = createLimiter(
  5 * 60 * 1000,    // 5 minutes
  3,                // 3 bulk operations per 5 minutes
  'Bulk operation limit exceeded',
  'Too many bulk operations. Please wait before trying again.'
);

module.exports = {
  globalLimiter,
  apiLimiter,
  notificationCreateLimiter,
  bulkOperationLimiter
};