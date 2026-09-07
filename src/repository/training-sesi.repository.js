// satff.repository.js

// inport libery
const { Op } = require("sequelize"); 

// import funtion
const db = require("../../connection/mysql.connection");
const { QueryError } = require("../../error/query.error");
const errorFormat = require("../../utility/error-format");
const { NotFoundError } = require("../../error/not-found.error");

//import model
const TrainingSesi = db.training_sesi;
const ProgramTraining = db.program_training;
const ParticipantTraining = db.participant_training;
const Participant = db.participant;
const Staff = db.staff;
const ReportSchedule  = db.report_schedule  ;
const Meeting  = db.meeting  ;

// 1. create training sesi
const create = async (payload, transaction = null) => {
  try {
    const config = {};
    if (transaction) config.transaction = transaction;

    const trainingsesi = await TrainingSesi.create(payload, config);
    return trainingsesi;
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};


const findAll = async (filter = {}) => {
  const search = filter.search?.trim() || "";
  const batch = parseInt(filter.batch) || 1;
  const size = parseInt(filter.size) || 10;
  const offset = (batch - 1) * size;

  const startDateFilter = filter.start_date ? new Date(filter.start_date) : null;
  const endDateFilter = filter.end_date ? new Date(filter.end_date) : null;

  let whereClause = {
    status_deleted: 1,
  };

  if (filter.staff_id) {
    whereClause.staff_id = filter.staff_id;
  }
  let includeClause = [
    {
      model: ProgramTraining,
      as: "program_training",
      required: false,
    },
    {
      model: Staff,
      as: "staff",
      required: false,
      where: {
        status_deleted: 1,
      },
      attributes: ["staff_id", "name", "email", "username", "role_id"],
    },
  ];


  if (
    filter.training_sesi_id !== undefined &&
    filter.training_sesi_id !== null &&
    filter.training_sesi_id !== ""
  ) {
    whereClause.training_sesi_id = filter.training_sesi_id;
  }

  // 🔍 Filter berdasarkan rentang tanggal (jika ada)
  if (startDateFilter && endDateFilter) {
    whereClause.start_date = {
      [Op.between]: [startDateFilter, endDateFilter],
    };
  } else if (startDateFilter) {
    whereClause.start_date = {
      [Op.gte]: startDateFilter,
    };
  } else if (endDateFilter) {
    whereClause.start_date = {
      [Op.lte]: endDateFilter,
    };
  }

  // 🔍 Pencarian berdasarkan nama sesi atau nama program training
  const sesiMatchCount = await TrainingSesi.count({
    where: { name: { [Op.like]: `%${search}%` } },
  });

  if (sesiMatchCount > 0) {
    whereClause.name = { [Op.like]: `%${search}%` };
  } else {
    const program = await ProgramTraining.findOne({
      where: { name: { [Op.like]: `%${search}%` } },
    });

    if (program) {
      whereClause.program_training_id = program.program_training_id;
    } else {
      return {
        page: {
          total_record_count: 0,
          maxPage: 0,
          batch_number: batch,
          raw_length: 0,
          max_raw_size: size,
        },
        records: [],
      };
    }
  }

  // Hitung total
  const totalRecordCount = await TrainingSesi.count({
    where: whereClause,
    include: includeClause,
    distinct: true,
  });

  const sessions = await TrainingSesi.findAll({
    where: whereClause,
    include: includeClause,
    offset,
    limit: size,
    order: [
      ["start_date", startDateFilter || endDateFilter ? "ASC" : "DESC"]
    ],
  });

  const records = await Promise.all(
    sessions.map(async (session) => {
      const [countPeserta, countReportSchedule, countMeeting] = await Promise.all([
        ParticipantTraining.count({
          where: {
            training_sesi_id: session.training_sesi_id,
          },
          include: [
            {
              model: Participant,
              as: "participant",
              where: { status_deleted: 1 },
              required: true,
            },
          ],
        }),
        ReportSchedule.count({
          where: {
            training_sesi_id: session.training_sesi_id,
          },
        }),
        Meeting.count({
          where: {
            training_sesi_id: session.training_sesi_id,
          },
        }),
      ]);

      return {
        ...session.toJSON(),
        total_participant: countPeserta,
        total_report_schedule: countReportSchedule,
        total_meeting: countMeeting,
      };
    })
  );

  const maxPage = Math.ceil(totalRecordCount / size);
  const rawLength = records.length;

  return {
    page: {
      total_record_count: totalRecordCount,
      maxPage,
      batch_number: batch,
      raw_length: rawLength,
      max_raw_size: size,
    },
    records,
  };
};


// 3. update data training sesi 
const update = async (data = {}, where, transaction = false) => {
  try {
      let config = {
          where: where
      };

      // set transaction
      if (transaction) config.transaction = transaction;

      return await TrainingSesi.update(data, config);
  } catch (error) {
      const errObj = await errorFormat.sequelizeDB(error);
      throw new NotFoundError(errObj.metaData.message, errObj);
  }
}


// 4 detail
const findById = async (id) => {

  try {
  return await TrainingSesi.findOne({
    where: { training_sesi_id: id },
  });

  } catch (error) {
      const errObj = await errorFormat.sequelizeDB(error);
      throw new NotFoundError(errObj.metaData.message, errObj);
  }
};


const deleteByParticipantAndSesi = async (participant_id, training_sesi_id, transaction) => {
  return ParticipantTraining.destroy({
    where: {
      participant_id,
      training_sesi_id,
    },
    transaction,
  });
};

module.exports = {
  create,
  findAll,
  update,
  findById,
  deleteByParticipantAndSesi
};
