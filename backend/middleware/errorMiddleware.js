const ApiResponse = require('../utils/ApiResponse');

const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.name === 'ValidationError') {
    return ApiResponse.error(res, 400, 'Invalid request data');
  }

  if (error.name === 'CastError') {
    return ApiResponse.error(res, 400, 'Invalid resource identifier');
  }

  const statusCode = error.statusCode || 500;
  const message =
    statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'Unable to complete the request'
      : error.message || 'Unable to complete the request';

  return ApiResponse.error(res, statusCode, message);
};

module.exports = errorMiddleware;