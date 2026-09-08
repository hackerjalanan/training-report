// statistic.service.js

const statcRepository = require("../repository/statistic.repository");

const defaultStats = {
  total: 0,
  selesai: 0,
  belum_selesai: 0,
  progress_percent: "0%",
  statusBreakdown: [],
  schedule_report_summary: { total_schedule: 0, with_report: 0, without_report: 0 },
  trainer_report_stats: [],
  program_summary: []
};

const fetchStatc = async () => {
  try {
    return await statcRepository.getGlobalReportStatistics();
  } catch (error) {
    console.error("Error in fetchStatc:", error);
    return defaultStats;
  }
};

const fetchStatcByTraining = async () => {
  try {
    return await statcRepository.getDetailedProgressByTraining();
  } catch (error) {
    console.error("Error in fetchStatcByTraining:", error);
    return [];
  }
};

const totalPersen = async (req) => {
  try {
    const { startDate, endDate } = req.body;
    return await statcRepository.getGlobalReportStatistics(startDate, endDate);
  } catch (error) {
    console.error("Error in totalPersen:", error);
    return defaultStats;
  }
};

module.exports = { fetchStatc, fetchStatcByTraining, totalPersen };
