const createError = require("http-errors");

const { errorResponse } = require("../utility/error-respon.utility");

// Middleware untuk menangani error 404
function handle404Error(req, res, next) {
  next(createError(404, "URL not found"));
}

// Middleware untuk menangani error lainnya
function errorHandler(err, req, res, next) {
  // Jika error status adalah 404, gunakan format yang sesuai
  if (err.status === 404) {
    return errorResponse(res, err, {
      message: err.message || "URL not found",
      code: "404",
      response_code: "0004",
    });
  }

  // Menangani error lainnya dengan format standar
  return errorResponse(res, err, {
    message: err.message || "Server error",
    code: err.status || "500",
    response_code: "0001",
  });
}

module.exports = { handle404Error, errorHandler };
