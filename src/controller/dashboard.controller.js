
// import funtion
const  dashboardService = require("../service/dashboard.service");
const { successResponse } = require("../../utility/success-respon.utility");

// 1. get all data role
const showAllActivity = async (req, res, next) => {
  try {
    const data = await dashboardService.getRecentActivityLogs();

    return successResponse(res, data, {
      message: "Menampilkan log aktivitas terbaru.",
      code: 200,
      response_code: "0001",
    });
  } catch (error) {
    next(error);
  }
};

// 2. total dashboard
const fetchPTList = async (req, res, next) => {
  try {

    const data = await dashboardService.fetchPTList(req); // tidak pakai (req)

    return successResponse(res, data, {
      message: "Menampilkan total keseluruhan training .",
      code: 200,
      response_code: "0001",
    });
  } catch (error) {
      next(error);
  }
};


// 3. grafik total
const fetchTrainingGraph = async (req, res, next) => {
  try {
    const data = await dashboardService.fetchTrainingGraph(); // tidak pakai (req)

    return successResponse(res, data, {
      message: "Menampilkan grafik keseluruhan training .",
      code: 200,
      response_code: "0001",
    });
  } catch (error) {
      next(error);
  }
};


module.exports = {
    showAllActivity,
    fetchPTList,
    fetchTrainingGraph
}