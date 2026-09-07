const { Op } = require("sequelize");
const { NotFoundError } = require("../../error/not-found.error");
const { QueryError } = require("../../error/query.error")
const { InvalidParameterError } = require("../../error/invalid-parameter.error") 

const db = require("../../connection/mysql.connection");
const ReportSchedule = db.report_schedule;
const Meeting = db.meeting;
const TrainingSesi = db.training_sesi;
const ReportType = db.report_type;
const Report = db.repot;

const getAll = async (filter = {}) => {
  const {
    report_schedule_id,
    search = '',
    batch = 1,
    size = 5,
    training_sesi_id,
  } = filter;

  const where = {};

  if (report_schedule_id) {
    where.report_schedule_id = report_schedule_id;
  }

  if (training_sesi_id) {
    where.training_sesi_id = training_sesi_id;
  }

  if (search.trim() !== '') {
    where[Op.or] = [
      { '$report_type.name$': { [Op.like]: `%${search.trim()}%` } },
    ];
  }

  const offset = (batch - 1) * size;

  try {
    const totalCount = await ReportSchedule.count({
      where,
      include: [
        {
          model: db.report_type,
          as: 'report_type',
          required: false
        }
      ]
    });

    const schedules = await ReportSchedule.findAll({
      where,
      include: [
        {
          model: db.training_sesi,
          as: 'training_sesi',
          required: false
        },
        {
          model: db.report_type,
          as: 'report_type',
          required: false
        },
        {
          model: db.report, // Tambahkan include untuk tabel report
          as: 'reports', // Sesuaikan dengan alias yang sudah didefinisikan di model
          required: false
        }
      ],
      limit: size,
      offset,
      order: [['created_at', 'DESC']],
    });

    // Tambahkan status_dibuat ke setiap record
    const schedulesWithStatus = schedules.map(schedule => {
      const scheduleData = schedule.toJSON();
      
      // Cek apakah ada report yang terkait dengan report_schedule_id ini
      const hasReport = scheduleData.reports && scheduleData.reports.length > 0;
      
      // Tambahkan field status_dibuat
      scheduleData.status_dibuat = hasReport ? 'sudah' : 'belum';
      
      return scheduleData;
    });

    const maxPage = Math.ceil(totalCount / size);

    return {
      page: {
        total_record_count: totalCount,
        maxPage,
        batch_number: batch,
        raw_length: schedules.length,
        max_raw_size: size
      },
      records: schedulesWithStatus
    };

  } catch (error) {
    console.error('Error in report_schedule findAll:', error);
    throw new QueryError(`Failed to retrieve report schedules: ${error.message}`);
  }
};


const create = async (data) => {
  return await ReportSchedule.create(data);
};

const update = async (data = {}, where, transaction = false) => {
  try {
    const config = { where };
    if (transaction) config.transaction = transaction;

    return await ReportSchedule.update(data, config);
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};


const remove = async (id) => {
  return await ReportSchedule.destroy({
    where: { report_schedule_id: id },
  });
};


const getMeetingsByTrainingSesiId = async (trainingSesiId) => {
  try {
    const meetings = await Meeting.findAll({
      where: { training_sesi_id: trainingSesiId },
      order: [['start_date', 'ASC']],
    });
    return meetings;
  } catch (error) {
    throw new Error(`Failed to get meetings by training_sesi_id: ${error.message}`);
  }
};



const getUnusedReportTypesByMeeting = async (meetingId, excludeReportTypeId = null) => {
  try {
    // Ambil semua report_type_id yang sudah dipakai untuk meeting tertentu
    const usedSchedules = await ReportSchedule.findAll({
      attributes: ['report_type_id'],
      where: { meeting_id: meetingId },
    });

    // Ambil daftar report_type_id yang dipakai
    let usedIds = usedSchedules.map(s => s.report_type_id);

    // Jika sedang update, maka exclude id yang sedang diedit
    if (excludeReportTypeId) {
      usedIds = usedIds.filter(id => id !== excludeReportTypeId);
    }

    // Ambil report_type yang belum digunakan
    const unusedReportTypes = await ReportType.findAll({
      where: {
        report_type_id: {
          [Op.notIn]: usedIds.length ? usedIds : [''], // kosongkan jika tidak ada ID terpakai
        },
      },
      order: [['name', 'ASC']],
    });

    return unusedReportTypes;
  } catch (error) {
    throw new Error(`Failed to get unused report types: ${error.message}`);
  }
};

module.exports = {
  getAll,
  create,
  update,
  remove,
  getMeetingsByTrainingSesiId,
  getUnusedReportTypesByMeeting
};
