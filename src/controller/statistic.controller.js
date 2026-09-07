// controllers/trainingStatsController.js

const trainingStatsService = require('../service/statistic.service');
const { successResponse } = require('../../utility/success-respon.utility');

// 1. Get global report statistics
const getStatc = async (req, res, next) => {
  try {
    const data = await trainingStatsService.fetchStatc();
    return successResponse(res, data, {
      message: "Statistik global berhasil diambil.",
      code: 200,
      response_code: "0001",
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get detailed statistics by training
const getStatcByTraining = async (req, res, next) => {
  try {
    const data = await trainingStatsService.fetchStatcByTraining();
    return successResponse(res, data, {
      message: "Statistik berdasarkan pelatihan berhasil diambil.",
      code: 200,
      response_code: "0002",
    });
  } catch (error) {
    next(error);
  }
};

// 3. total persen
const totalPersen = async (req, res, next) => {
  try {
    const data = await trainingStatsService.totalPersen(req);
    return successResponse(res, data, {
      message: "Statistik berdasarkan pelatihan berhasil diambil.",
      code: 200,
      response_code: "0002",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStatc,
  getStatcByTraining,
  totalPersen
};
