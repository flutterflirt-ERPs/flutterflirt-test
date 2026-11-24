const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Relaxed to 100 requests per 15 mins for development and smooth admin login
  message: {
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, 
  legacyHeaders: false,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
});

// Protect contact & lead endpoints: max 15 queries per IP every 15 minutes
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    message: 'Too many inquiries submitted from this network. Please wait a few minutes before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
});

module.exports = {
  authLimiter,
  contactLimiter
};
