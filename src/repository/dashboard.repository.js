
// #inport libery
const { Op, fn, col } = require("sequelize");
const { QueryError } = require('../../error/query.error');
const { NotFoundError } = require("../../error/not-found.error");

//import model
const db = require("../../connection/mysql.connection");
const staff = db.staff
const report = db.report;
const report_type = db.report_type
const report_schedule = db.report_schedule;
const training_sesi = db.training_sesi
const participant_training = db.participant_training
const participant = db.participant

// 1. tampil aktivity
const getRecentActivities = async (limit = 10) => {
  try {
    const recentReports = await report.findAll({
      include: [
        {
          model: training_sesi,
          as: 'training_sesis',
          attributes: ['name', 'start_date']
        },
        {
          model: staff,
          as: 'staff',
          attributes: ['name']
        },
        {
          model: report_schedule,
          as: 'report_schedule',
          attributes: ['report_schedule_id'],
          include: [
            {
              model: report_type,
              as: 'report_type',
              attributes: ['name']
            }
          ]
        }
      ],
      where: { status_delete: 1 },
      order: [['created_at', 'DESC']],
      limit
    });

    const recentParticipants = await participant_training.findAll({
      include: [
        {
          model: training_sesi,
          as: 'training_sesi',
          attributes: ['name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit
    });

    return { recentReports, recentParticipants };
  } catch (error) {
    throw new NotFoundError("Gagal mengambil data sesi training: " + error.message);
  }
};


// 2. menampilkan total pelatihan
const getTrainingSummary = async (roleId, staffId) => {
  try {
    // Siapkan whereClause untuk training_sesi
    const trainingWhere = {
      status_deleted: 1,
    };

    if (roleId === 4) {
      trainingWhere.staff_id = staffId;
    }

    // 1. Total semua sesi pelatihan yang belum dihapus
    const totalTrainingSesi = await training_sesi.count({
      where: trainingWhere,
    });

    // 2. Total sesi pelatihan dengan status 'active'
    const totalTrainingActive = await training_sesi.count({
      where: {
        ...trainingWhere,
        status_active: 'active',
      },
    });

    // 3. Total sesi pelatihan dengan status 'finish'
    const totalTrainingFinish = await training_sesi.count({
      where: {
        ...trainingWhere,
        status_active: 'finish',
      },
    });

    // 4. Total peserta yang belum dihapus
    const totalParticipant = await participant.count({
      where: {
        status_deleted: 1,
      },
    });

    // 5. Total laporan (berdasarkan role)
    const reportWhere = {
      status_delete: 1,
    };

    if (roleId === 4) {
      reportWhere.staff_id = staffId;
    }

    const totalReport = await report.count({
      where: reportWhere,
    });

    // Return summary
    return {
      totalTrainingSesi,
      totalTrainingActive,
      totalTrainingFinish,
      totalParticipant,
      totalReport,
      totalTrainingByRole: totalTrainingSesi, // optional: bisa pakai totalTrainingSesi langsung
    };
  } catch (error) {
    throw new NotFoundError("Gagal mengambil data sesi training: " + error.message);
  }
};



// 3. gravik training
const getTrainingGraphData = async () => {
  // Mengelompokkan jumlah sesi training berdasarkan bulan dan status
  const data = await training_sesi.findAll({
    attributes: [
      [fn("MONTH", col("start_date")), "month"],
      [fn("YEAR", col("start_date")), "year"],
      "status_active",
      [fn("COUNT", col("training_sesi_id")), "total"],
    ],
    where: {
      status_deleted: 1,
    },
    group: ["month", "year", "status_active"],
    order: [
      [fn("YEAR", col("start_date")), "ASC"],
      [fn("MONTH", col("start_date")), "ASC"]
    ],
    raw: true,
  });

  return data;
};

module.exports = {
  getTrainingSummary,
  getTrainingGraphData,
  getRecentActivities
}