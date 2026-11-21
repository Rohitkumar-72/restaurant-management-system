const ApiError = require('../utils/ApiError');

const validateAdminLogin = (req, res, next) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return next(new ApiError(400, 'Enter a valid email and password'));
  }
  if (!password || password.length < 8 || password.length > 128) {
    return next(new ApiError(400, 'Enter a valid email and password'));
  }

  req.body.email = email;
  req.body.password = password;
  return next();
};

module.exports = { validateAdminLogin };