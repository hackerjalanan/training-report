const { Op, fn, col } = require('sequelize');
const db = require("../../connection/mysql.connection");

const report = db.report;
const training_sesi = db.training_sesi;
const report_schedule = db.report_schedule;
const staff = db.staff;
const program_training = db.program_training;
const meeting = db.meeting;

async function calculateReportProgress(trainingSesiId = null) {
  const baseTrainingCondition = { status_deleted: 1 };
  if (trainingSesiId) baseTrainingCondition.training_sesi_id = trainingSesiId;

  const include = { model: training_sesi, as: 'training_sesi', where: baseTrainingCondition, required: true };

  const [totalReportSchedules, completedReports, pendingReports] = await Promise.all([
    report_schedule.count({ include: [{ model: training_sesi, as: 'training_sesi', where: baseTrainingCondition, required: true }] }),
    report.count({
      where: { status_acc: 'disetujui', acc_director_status: 'disetujui', status_delete: 1 },
      include: [{ model: training_sesi, as: 'training_sesis', where: baseTrainingCondition, required: true }]
    }),
    report.count({
      where: { [Op.or]: [{ status_acc: 'menunggu' }, { status_acc: 'ditolak' }, { acc_director_status: 'menunggu' }, { acc_director_status: 'ditolak' }], status_delete: 1 },
      include: [{ model: training_sesi, as: 'training_sesis', where: baseTrainingCondition, required: true }]
    })
  ]);

  const total = totalReportSchedules;
  const notStartedReports = total - completedReports - pendingReports;
  const finishedPct = total > 0 ? Math.round((completedReports / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pendingReports / total) * 100) : 0;
  const notStartedPct = total > 0 ? Math.round((notStartedReports / total) * 100) : 0;

  return {
    total: totalReportSchedules,
    completed: { count: completedReports, percentage: finishedPct },
    pending: { count: pendingReports, percentage: pendingPct },
    notStarted: { count: notStartedReports, percentage: notStartedPct },
    summary: { finished: finishedPct, unfinished: 100 - finishedPct }
  };
}

async function getDetailedProgressByTraining() {
  const trainingSesis = await training_sesi.findAll({
    where: { status_deleted: 1 },
    attributes: ['training_sesi_id', 'name', 'location', 'start_date', 'end_date'],
    order: [['start_date', 'DESC']]
  });

  const results = [];
  for (const t of trainingSesis) {
    const progress = await calculateReportProgress(t.training_sesi_id);
    results.push({
      training_sesi_id: t.training_sesi_id,
      training_name: t.name,
      location: t.location,
      start_date: t.start_date,
      end_date: t.end_date,
      progress
    });
  }
  return results;
}


async function getGlobalReportStatistics(startDate = null, endDate = null) {
  const trainingDateFilter = { status_deleted: 1 };
  if (startDate && endDate) {
    trainingDateFilter.start_date = { [Op.gte]: startDate };
    trainingDateFilter.end_date = { [Op.lte]: endDate };
  }

  const statusBreakdown = await report.findAll({
    attributes: ['status_acc', 'acc_director_status', [fn('COUNT', col('*')), 'count']],
    include: [{ model: training_sesi, as: 'training_sesis', attributes: [], where: trainingDateFilter, required: true }],
    where: { status_delete: 1 },
    group: ['status_acc', 'acc_director_status'],
    raw: true
  });

  const totalReports = statusBreakdown.reduce((sum, item) => sum + parseInt(item.count), 0);
  const selesaiCount = statusBreakdown.reduce((sum, item) =>
    (item.status_acc === 'disetujui' && item.acc_director_status === 'disetujui') ? sum + parseInt(item.count) : sum, 0);
  const progressPercent = totalReports > 0 ? `${Math.round((selesaiCount / totalReports) * 100)}%` : '0%';

  const allSchedules = await report_schedule.findAll({
    include: [{
      model: training_sesi,
      as: 'training_sesi',
      attributes: ['training_sesi_id', 'program_training_id', 'staff_id', 'start_date', 'end_date'],
      where: trainingDateFilter,
      include: [{ model: program_training, as: 'program_training', attributes: ['name'], required: false }],
      required: true
    }],
    attributes: ['report_schedule_id'],
    raw: true
  });

  const allScheduleIds = allSchedules.map(s => s.report_schedule_id);

  const [existingReports, scheduleByStaff, sesiCounts, reportPerStaff] = await Promise.all([
    report.findAll({ where: { report_schedule_id: { [Op.in]: allScheduleIds }, status_delete: 1 }, attributes: ['report_schedule_id'], raw: true }),
    report_schedule.findAll({
      where: { report_schedule_id: { [Op.in]: allScheduleIds } },
      include: [{ model: training_sesi, as: 'training_sesi', attributes: ['staff_id'], where: trainingDateFilter, required: true }],
      attributes: ['report_schedule_id'], raw: true
    }),
    meeting.findAll({
      include: [{ model: training_sesi, as: 'training_sesi', attributes: [], where: trainingDateFilter, required: true }],
      attributes: ['training_sesi_id', [fn('COUNT', col('meeting_id')), 'total_sesi']],
      group: ['training_sesi_id'], raw: true
    }),
    report.findAll({
      where: { report_schedule_id: { [Op.in]: allScheduleIds }, status_delete: 1 },
      include: [{ model: staff, as: 'staff', attributes: ['staff_id', 'name'], required: true }],
      attributes: ['staff_id', 'report_schedule_id'], raw: true
    })
  ]);

  const reportedScheduleIds = new Set(existingReports.map(r => r.report_schedule_id));

  const reportCountByStaff = {};
  for (const r of reportPerStaff) {
    const staffId = r.staff_id;
    const name = r['staff.name'];
    if (!reportCountByStaff[staffId]) reportCountByStaff[staffId] = { staff_id: staffId, name, report_count: 0 };
    reportCountByStaff[staffId].report_count++;
  }

  const scheduleCountByStaff = {};
  for (const s of scheduleByStaff) {
    const staffId = s['training_sesi.staff_id'];
    scheduleCountByStaff[staffId] = (scheduleCountByStaff[staffId] || 0) + 1;
  }

  const trainerStats = Object.entries(scheduleCountByStaff).map(([staffId, totalSchedule]) => {
    const reportInfo = reportCountByStaff[staffId] || { report_count: 0, name: '(Tidak dikenal)' };
    const reported = reportInfo.report_count;
    const percentage = totalSchedule > 0 ? Math.round((reported / totalSchedule) * 100) : 0;
    return { staff_id: staffId, name: reportInfo.name, reported, total_schedule: totalSchedule, ratio: `${reported}/${totalSchedule}`, percent: `${percentage}%` };
  });

  const programSesiInfo = {};
  for (const s of allSchedules) {
    const sesi = sesiCounts.find(m => m.training_sesi_id === s['training_sesi.training_sesi_id']);
    const trainingId = s['training_sesi.training_sesi_id'];
    const programName = s['training_sesi.program_training.name'] || 'Tidak diketahui';
    if (!programSesiInfo[programName]) programSesiInfo[programName] = { program: programName, total_sesi: 0, jumlah_kelas: new Set() };
    programSesiInfo[programName].jumlah_kelas.add(trainingId);
    programSesiInfo[programName].total_sesi += sesi ? parseInt(sesi.total_sesi) : 0;
  }

  const program_summary = Object.values(programSesiInfo).map(p => ({
    program: p.program, jumlah_kelas: p.jumlah_kelas.size, total_sesi: p.total_sesi
  }));

  return {
    total: totalReports,
    selesai: selesaiCount,
    belum_selesai: totalReports - selesaiCount,
    progress_percent: progressPercent,
    statusBreakdown,
    schedule_report_summary: { total_schedule: allScheduleIds.length, with_report: reportedScheduleIds.size, without_report: allScheduleIds.length - reportedScheduleIds.size },
    trainer_report_stats: trainerStats,
    program_summary
  };
}

module.exports = { calculateReportProgress, getDetailedProgressByTraining, getGlobalReportStatistics };
