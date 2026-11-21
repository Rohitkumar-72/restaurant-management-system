class ApiResponse {
  static success(res, statusCode, data, message = 'Request successful') {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
    });
  }

  static error(res, statusCode, message, data = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(data ? { data } : {}),
    });
  }
}

module.exports = ApiResponse;