// statistic.service.js


const statcRepository = require("../repository/statistic.repository");
const { NotFoundError } = require("../../error/not-found.error");


const fetchStatc = async () => {
  try {
    const data = await statcRepository.getGlobalReportStatistics();
    return data;
  } catch (error) {
    console.error("Error in statistic.service.js > fetchStatc:", error);
    throw new NotFoundError("Data statistik tidak ditemukan");
  }
};


const fetchStatcByTraining = async () => {
  try {
    const data = await statcRepository.getDetailedProgressByTraining();
    return data;
  } catch (error) {
    console.error("Error in statistic.service.js > fetchStatcByTraining:", error);
    throw new NotFoundError("Statistik per training tidak ditemukan");
  }
};

const totalPersen = async (req) => {
    const {startDate, endDate} = req.body
  try {
    const data = await statcRepository.getGlobalReportStatistics(startDate, endDate);
    return data;
  } catch (error) {
    console.error("Error in statistic.service.js > fetchStatcByTraining:", error);
    throw new NotFoundError("Statistik per training tidak ditemukan");
  }
};

module.exports = {
  fetchStatc,
  fetchStatcByTraining,
  totalPersen,
};
