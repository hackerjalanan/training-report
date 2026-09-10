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
  try {
    const whereReport = {
      status_delete: 1,
    };

    const whereSesi = {
      status_deleted: 1,
    };

    if (startDate && endDate) {
      whereSesi.start_date = {
        [Op.gte]: startDate,
      };

      whereSesi.end_date = {
        [Op.lte]: endDate,
      };
    }

    // =====================================================
    // TOTAL REPORT
    // =====================================================

    const totalReports = await report.count({
      where: whereReport,
      include: [
        {
          model: training_sesi,
          as: "training_sesis",
          attributes: [],
          where: whereSesi,
          required: true,
        },
      ],
      distinct: true,
      col: "report_id",
    });

    // =====================================================
    // STATUS BREAKDOWN
    // =====================================================

    const statusBreakdown = await report.findAll({
      attributes: [
        "status_acc",
        "acc_director_status",
        [fn("COUNT", col("report.report_id")), "count"],
      ],

      where: whereReport,

      include: [
        {
          model: training_sesi,
          as: "training_sesis",
          attributes: [],
          where: whereSesi,
          required: true,
        },
      ],

      group: [
        "report.status_acc",
        "report.acc_director_status",
      ],

      raw: true,
    });

    console.log("TOTAL REPORT:", totalReports);

    console.log(
      "STATUS BREAKDOWN:",
      JSON.stringify(statusBreakdown, null, 2)
    );

    // =====================================================
    // SELESAI
    // =====================================================

    const selesaiCount = statusBreakdown.reduce(
      (sum, item) => {
        const statusAcc = String(
          item.status_acc ?? ""
        ).toLowerCase();

        const directorStatus = String(
          item.acc_director_status ?? ""
        ).toLowerCase();

        // Support status text dan numeric
        const accApproved =
          statusAcc === "disetujui" ||
          statusAcc === "approved" ||
          statusAcc === "2";

        const directorApproved =
          directorStatus === "disetujui" ||
          directorStatus === "approved" ||
          directorStatus === "2";

        if (
          accApproved &&
          directorApproved
        ) {
          return sum + Number(item.count || 0);
        }

        return sum;
      },
      0
    );

    const belumSelesai =
      totalReports - selesaiCount;

    const progressPercent =
      totalReports > 0
        ? `${Math.round(
            (selesaiCount / totalReports) * 100
          )}%`
        : "0%";

    // =====================================================
    // REPORT SCHEDULE
    // =====================================================

    const allSchedules = await report_schedule.findAll({
      attributes: [
        "report_schedule_id",
        "training_sesi_id",
      ],

      include: [
        {
          model: training_sesi,
          as: "training_sesi",
          attributes: [
            "training_sesi_id",
            "program_training_id",
            "staff_id",
            "start_date",
            "end_date",
          ],
          where: whereSesi,
          required: true,

          include: [
            {
              model: program_training,
              as: "program_training",
              attributes: [
                "program_training_id",
                "name",
              ],
              required: false,
            },
          ],
        },
      ],

      raw: true,
    });

    const allScheduleIds =
      allSchedules
        .map(
          (item) =>
            item.report_schedule_id
        )
        .filter(Boolean);

    // =====================================================
    // REPORT YANG SUDAH ADA
    // =====================================================

    const existingReports =
      allScheduleIds.length > 0
        ? await report.findAll({
            where: {
              report_schedule_id: {
                [Op.in]: allScheduleIds,
              },
              status_delete: 1,
            },

            attributes: [
              "report_id",
              "report_schedule_id",
              "staff_id",
            ],

            raw: true,
          })
        : [];

    const reportedScheduleIds =
      new Set(
        existingReports.map(
          (item) =>
            item.report_schedule_id
        )
      );

    // =====================================================
    // SCHEDULE PER STAFF
    // =====================================================

    const scheduleByStaff =
      allScheduleIds.length > 0
        ? await report_schedule.findAll({
            where: {
              report_schedule_id: {
                [Op.in]: allScheduleIds,
              },
            },

            attributes: [
              "report_schedule_id",
              "training_sesi_id",
            ],

            include: [
              {
                model: training_sesi,
                as: "training_sesi",
                attributes: [
                  "staff_id",
                ],
                where: whereSesi,
                required: true,
              },
            ],

            raw: true,
          })
        : [];

    // =====================================================
    // REPORT PER STAFF
    // =====================================================

    const reportPerStaff =
      allScheduleIds.length > 0
        ? await report.findAll({
            where: {
              report_schedule_id: {
                [Op.in]: allScheduleIds,
              },
              status_delete: 1,
            },

            attributes: [
              "report_id",
              "staff_id",
              "report_schedule_id",
            ],

            include: [
              {
                model: staff,
                as: "staff",
                attributes: [
                  "staff_id",
                  "name",
                ],
                required: false,
              },
            ],

            raw: true,
          })
        : [];

    // =====================================================
    // REPORT COUNT PER STAFF
    // =====================================================

    const reportCountByStaff = {};

    for (const item of reportPerStaff) {
      if (!item.staff_id) continue;

      if (!reportCountByStaff[item.staff_id]) {
        reportCountByStaff[item.staff_id] = {
          staff_id: item.staff_id,
          name:
            item["staff.name"] ||
            "(Tidak dikenal)",
          report_count: 0,
        };
      }

      reportCountByStaff[
        item.staff_id
      ].report_count++;
    }

    // =====================================================
    // SCHEDULE COUNT PER STAFF
    // =====================================================

    const scheduleCountByStaff = {};

    for (const item of scheduleByStaff) {
      const staffId =
        item["training_sesi.staff_id"];

      if (!staffId) continue;

      scheduleCountByStaff[staffId] =
        (scheduleCountByStaff[staffId] || 0) + 1;
    }

    // =====================================================
    // TRAINER STATS
    // =====================================================

    const trainerStats =
      Object.entries(
        scheduleCountByStaff
      ).map(
        ([staffId, totalSchedule]) => {
          const info =
            reportCountByStaff[
              staffId
            ] || {
              name: "(Tidak dikenal)",
              report_count: 0,
            };

          const reported =
            info.report_count;

          const percent =
            totalSchedule > 0
              ? Math.round(
                  (reported /
                    totalSchedule) *
                    100
                )
              : 0;

          return {
            staff_id: staffId,
            name: info.name,
            reported,
            total_schedule:
              totalSchedule,
            ratio: `${reported}/${totalSchedule}`,
            percent: `${percent}%`,
          };
        }
      );

    // =====================================================
    // MEETING COUNT
    // =====================================================

    const sesiCounts =
      await meeting.findAll({
        attributes: [
          "training_sesi_id",
          [
            fn(
              "COUNT",
              col("meeting_id")
            ),
            "total_sesi",
          ],
        ],

        include: [
          {
            model: training_sesi,
            as: "training_sesi",
            attributes: [],
            where: whereSesi,
            required: true,
          },
        ],

        group: [
          "meeting.training_sesi_id",
        ],

        raw: true,
      });

    const sesiCountMap = {};

    for (const item of sesiCounts) {
      sesiCountMap[
        item.training_sesi_id
      ] = Number(
        item.total_sesi || 0
      );
    }

    // =====================================================
    // PROGRAM SUMMARY
    // =====================================================

    const programMap = {};

    for (const item of allSchedules) {
      const sesiId =
        item[
          "training_sesi.training_sesi_id"
        ];

      const programName =
        item[
          "training_sesi.program_training.name"
        ] || "Tidak diketahui";

      if (!programMap[programName]) {
        programMap[programName] = {
          program: programName,
          jumlah_kelas: new Set(),
          total_sesi: 0,
        };
      }

      if (sesiId) {
        programMap[
          programName
        ].jumlah_kelas.add(sesiId);

        programMap[
          programName
        ].total_sesi +=
          sesiCountMap[sesiId] || 0;
      }
    }

    const program_summary =
      Object.values(programMap).map(
        (item) => ({
          program: item.program,
          jumlah_kelas:
            item.jumlah_kelas.size,
          total_sesi:
            item.total_sesi,
        })
      );

    // =====================================================
    // FINAL RESPONSE
    // =====================================================

    return {
      total: totalReports,

      selesai: selesaiCount,

      belum_selesai: belumSelesai,

      progress_percent:
        progressPercent,

      statusBreakdown,

      schedule_report_summary: {
        total_schedule:
          allScheduleIds.length,

        with_report:
          reportedScheduleIds.size,

        without_report:
          Math.max(
            allScheduleIds.length -
              reportedScheduleIds.size,
            0
          ),
      },

      trainer_report_stats:
        trainerStats,

      program_summary,
    };
  } catch (error) {
    console.error(
      "Error getGlobalReportStatistics:",
      error
    );

    throw error;
  }
}

module.exports = { calculateReportProgress, getDetailedProgressByTraining, getGlobalReportStatistics };
