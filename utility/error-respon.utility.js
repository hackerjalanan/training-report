// utility/error-respon.utility.js

function errorResponse(res, metaData = {
  message: "Terjadi kesalahan.",
  code: "INTERNAL_ERROR",
  response_code: "0001"
}, statusCode = 500) {
  return res.status(statusCode).json({
    response: [],
    metaData
  });
}

module.exports = {
  errorResponse,
};
