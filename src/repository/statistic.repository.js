const { Op, fn, col } = require('sequelize');

const db = require("../../connection/mysql.connection");
const report = db.report;
const training_sesi = db.training_sesi;
const report_schedule = db.report_schedule;
const staff = db.staff;
const program_training = db.program_training;
const meeting = db.meeting;
const sequelize = db.sequelize;

async function calculateReportProgress(trainingSesiId = null) {
  try {
    const baseTrainingCondition = {
      status_deleted: 1
    };

    if (trainingSesiId) {
      baseTrainingCondition.training_sesi_id = trainingSesiId;
    }

    const totalReportSchedules = await report_schedule.count({
      include: [
        {
          model: training_sesi,
          as: 'training_sesi',
          where: baseTrainingCondition,
          required: true
        }
      ]
    });

    const completedReports = await report.count({
      where: {
        status_acc: 'disetujui',
        acc_director_status: 'disetujui',
        status_delete: 1
      },
      include: [
        {
          model: training_sesi,
          as: 'training_sesis',
          where: baseTrainingCondition,
          required: true
        }
      ]
    });

    const pendingReports = await report.count({
      where: {
        [Op.or]: [
          { status_acc: 'menunggu' },
          { status_acc: 'ditolak' },
          { acc_director_status: 'menunggu' },
          { acc_director_status: 'ditolak' }
        ],
        status_delete: 1
      },
      include: [
        {
          model: training_sesi,
          as: 'training_sesis',
          where: baseTrainingCondition,
          required: true
        }
      ]
    });

    const notStartedReports = totalReportSchedules - completedReports - pendingReports;

    const completedPercentage = totalReportSchedules > 0
      ? Math.round((completedReports / totalReportSchedules) * 100)
      : 0;

    const pendingPercentage = totalReportSchedules > 0
      ? Math.round((pendingReports / totalReportSchedules) * 100)
      : 0;

    const notStartedPercentage = totalReportSchedules > 0
      ? Math.round((notStartedReports / totalReportSchedules) * 100)
      : 0;

    return {
      total: totalReportSchedules,
      completed: {
        count: completedReports,
        percentage: completedPercentage
      },
      pending: {
        count: pendingReports,
        percentage: pendingPercentage
      },
      notStarted: {
        count: notStartedReports,
        percentage: notStartedPercentage
      },
      summary: {
        finished: completedPercentage,
        unfinished: 100 - completedPercentage
      }
    };

  } catch (error) {
    throw new Error(`Error calculating report progress: ${error.message}`);
  }
}

async function getDetailedProgressByTraining() {
  try {
    const trainingSesis = await training_sesi.findAll({
      where: {
        status_deleted: 1
      },
      attributes: ['training_sesi_id', 'name', 'location', 'start_date', 'end_date'],
      order: [['start_date', 'DESC']]
    });

    const results = [];

    for (const trainingSesi of trainingSesis) {
      const progress = await calculateReportProgress(trainingSesi.training_sesi_id);

      results.push({
        training_sesi_id: trainingSesi.training_sesi_id,
        training_name: trainingSesi.name,
        location: trainingSesi.location,
        start_date: trainingSesi.start_date,
        end_date: trainingSesi.end_date,
        progress: progress
      });
    }

    return results;

  } catch (error) {
    throw new Error(`Error getting detailed progress: ${error.message}`);
  }
}


const getGlobalReportStatistics = async (startDate = null, endDate = null) => {
  try {
    // Build filter kondisi tanggal aktif
    const trainingDateFilter = { status_deleted: 1 };
    if (startDate && endDate) {
      trainingDateFilter.start_date = { [Op.gte]: startDate };
      trainingDateFilter.end_date = { [Op.lte]: endDate };
    }

    // 1. Breakdown status report
    const statusBreakdown = await report.findAll({
      attributes: [
        'status_acc',
        'acc_director_status',
        [fn('COUNT', col('*')), 'count']
      ],
      include: [
        {
          model: training_sesi,
          as: 'training_sesis',
          attributes: [],
          where: trainingDateFilter,
          required: true
        }
      ],
      where: {
        status_delete: 1
      },
      group: ['status_acc', 'acc_director_status'],
      raw: true
    });

    const totalReports = statusBreakdown.reduce((sum, item) => sum + parseInt(item.count), 0);
    const selesaiCount = statusBreakdown.reduce((sum, item) =>
      (item.status_acc === 'disetujui' && item.acc_director_status === 'disetujui')
        ? sum + parseInt(item.count)
        : sum, 0
    );
    const belumSelesai = totalReports - selesaiCount;
    const progressPercent = totalReports > 0
      ? `${Math.round((selesaiCount / totalReports) * 100)}%`
      : '0%';

    // 2. Report Schedule aktif
    const allSchedules = await report_schedule.findAll({
      include: [
        {
          model: training_sesi,
          as: 'training_sesi',
          attributes: ['training_sesi_id', 'program_training_id', 'staff_id', 'start_date', 'end_date'],
          where: trainingDateFilter,
          include: [
            {
              model: program_training,
              as: 'program_training',
              attributes: ['name'],
              required: false
            }
          ],
          required: true
        }
      ],
      attributes: ['report_schedule_id'],
      raw: true
    });

    const allScheduleIds = allSchedules.map(s => s.report_schedule_id);

    const existingReports = await report.findAll({
      where: {
        report_schedule_id: { [Op.in]: allScheduleIds },
        status_delete: 1
      },
      attributes: ['report_schedule_id'],
      raw: true
    });

    const reportedScheduleIds = new Set(existingReports.map(r => r.report_schedule_id));
    const schedulesWithReport = reportedScheduleIds.size;
    const schedulesWithoutReport = allScheduleIds.length - reportedScheduleIds.size;

    // 4. Statistik per trainer
    const reportPerStaff = await report.findAll({
      where: {
        report_schedule_id: { [Op.in]: allScheduleIds },
        status_delete: 1
      },
      include: [
        {
          model: staff,
          as: 'staff',
          attributes: ['staff_id', 'name'],
          required: true
        }
      ],
      attributes: ['staff_id', 'report_schedule_id'],
      raw: true
    });

    const reportCountByStaff = {};
    for (const r of reportPerStaff) {
      const staffId = r.staff_id;
      const name = r['staff.name'];
      if (!reportCountByStaff[staffId]) {
        reportCountByStaff[staffId] = {
          staff_id: staffId,
          name,
          report_count: 0
        };
      }
      reportCountByStaff[staffId].report_count++;
    }

    const scheduleByStaff = await report_schedule.findAll({
      where: {
        report_schedule_id: { [Op.in]: allScheduleIds }
      },
      include: [
        {
          model: training_sesi,
          as: 'training_sesi',
          attributes: ['staff_id'],
          where: trainingDateFilter,
          required: true
        }
      ],
      attributes: ['report_schedule_id'],
      raw: true
    });

    const scheduleCountByStaff = {};
    for (const s of scheduleByStaff) {
      const staffId = s['training_sesi.staff_id'];
      if (!scheduleCountByStaff[staffId]) {
        scheduleCountByStaff[staffId] = 0;
      }
      scheduleCountByStaff[staffId]++;
    }

    const trainerStats = Object.entries(scheduleCountByStaff).map(([staffId, totalSchedule]) => {
      const reportInfo = reportCountByStaff[staffId] || { report_count: 0, name: '(Tidak dikenal)' };
      const reported = reportInfo.report_count;
      const percentage = totalSchedule > 0 ? Math.round((reported / totalSchedule) * 100) : 0;

      return {
        staff_id: staffId,
        name: reportInfo.name,
        reported,
        total_schedule: totalSchedule,
        ratio: `${reported}/${totalSchedule}`,
        percent: `${percentage}%`
      };
    });

    // 5. Jumlah sesi per training
    const sesiCounts = await meeting.findAll({
      include: [
        {
          model: training_sesi,
          as: 'training_sesi',
          attributes: [],
          where: trainingDateFilter,
          required: true
        }
      ],
      attributes: [
        'training_sesi_id',
        [fn('COUNT', col('meeting_id')), 'total_sesi']
      ],
      group: ['training_sesi_id'],
      raw: true
    });

    // 6. Gabungkan data program dan sesi
    const programSesiInfo = {};
    for (const s of allSchedules) {
      const sesi = sesiCounts.find(m => m.training_sesi_id === s['training_sesi.training_sesi_id']);
      const trainingId = s['training_sesi.training_sesi_id'];
      const programName = s['training_sesi.program_training.name'] || 'Tidak diketahui';

      if (!programSesiInfo[programName]) {
        programSesiInfo[programName] = {
          program: programName,
          total_sesi: 0,
          jumlah_kelas: new Set()
        };
      }

      programSesiInfo[programName].jumlah_kelas.add(trainingId);
      programSesiInfo[programName].total_sesi += sesi ? parseInt(sesi.total_sesi) : 0;
    }

    const program_summary = Object.values(programSesiInfo).map(p => ({
      program: p.program,
      jumlah_kelas: p.jumlah_kelas.size,
      total_sesi: p.total_sesi
    }));

    return {
      total: totalReports,
      selesai: selesaiCount,
      belum_selesai: belumSelesai,
      progress_percent: progressPercent,
      statusBreakdown,
      schedule_report_summary: {
        total_schedule: allScheduleIds.length,
        with_report: schedulesWithReport,
        without_report: schedulesWithoutReport
      },
      trainer_report_stats: trainerStats,
      program_summary
    };

  } catch (error) {
    console.error('Error in getGlobalReportStatistics:', error);
    throw new Error(`Failed to generate report statistics: ${error.message}`);
  }
};






module.exports = {
  calculateReportProgress,
  getDetailedProgressByTraining,
  getGlobalReportStatistics
};
