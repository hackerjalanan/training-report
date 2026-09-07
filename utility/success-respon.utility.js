
// 1. Response standar untuk success
function successResponse(
  res,
  data = [],
  metaData = { message: "Success", code: 200, response_code: "0000" },
) {
  return res.status(200).json({
    response: data,
    metaData: metaData,
  });
}
module.exports = {
  successResponse,
};
