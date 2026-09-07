// sataff.repository.js

// #inport libery
const { Op } = require("sequelize"); 

// #import funtion
const { QueryError } = require("../../error/query.error");
const { NotFoundError } = require("../../error/not-found.error");
const errorFormat = require("../../utility/error-format");

//import model
const db = require("../../connection/mysql.connection");
const Participant = db.participant;
const TrainingSesi = db.training_sesi;
const ProgramTraining = db.program_training;
const ParticipantTraining = db.participant_training;
const Present = db.present;

// 1. create training sesi + participant
const createParticipant = async (payload, transaction = null) => {
  try {
    const config = {};
    if (transaction) config.transaction = transaction;

    return await Participant.create(payload, config);
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

// 2. participant training
const createParticipantTraining = async (payloads, transaction = null) => {
  try {
    const config = {};
    if (transaction) config.transaction = transaction;

    return await ParticipantTraining.bulkCreate(payloads, config);
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

// 3. filter
const buildIncludeFilter = (filter) => {
  const trainingSesiWhere = {
    status_deleted: 1, // hanya ambil sesi aktif
  };

  if (filter.training_sesi_id) {
    trainingSesiWhere.training_sesi_id = filter.training_sesi_id;
  }

  return [
    {
      model: ParticipantTraining,
      as: "participant_training",
      required: false, // tetap false agar participant tetap tampil
      where: filter.training_sesi_id ? { training_sesi_id: filter.training_sesi_id } : undefined,
      include: [
        {
          model: TrainingSesi,
          as: "training_sesi",
          required: false, // tetap false agar relasi null jika tidak cocok
          where: trainingSesiWhere,
          include: [
            {
              model: ProgramTraining,
              as: "program_training",
              required: false,
              where: filter.program_training_id
                ? { program_training_id: filter.program_training_id }
                : undefined,
            },
          ],
        },
      ],
    },
  ];
};

// 3.1 Fungsi utama untuk fetch data lengkap
const findAll = async (options = {}, filter = {}) => {
  const whereClause = { status_deleted: 1 };

  if (filter.search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${filter.search}%` } },
      { agency: { [Op.like]: `%${filter.search}%` } },
      { email: { [Op.like]: `%${filter.search}%` } },
      { domicile: { [Op.like]: `%${filter.search}%` } },
    ];
  }

  let participants = [];

  if (filter.participant_id) {
    participants = await Participant.findAll({
      where: {
        participant_id: filter.participant_id,
        ...whereClause,
      },
      include: buildIncludeFilter(filter),
      order: [["created_at", "DESC"]],
      ...options,
    });
  } else {
    // Tambahkan kondisi untuk filter training_sesi_id atau program_training_id
    let includeFilter = buildIncludeFilter(filter);
    let requireParticipantTraining = false;
    
    // Jika ada filter training_sesi_id atau program_training_id, ubah required menjadi true
    if (filter.training_sesi_id || filter.program_training_id) {
      includeFilter[0].required = true;
      
      if (filter.program_training_id) {
        includeFilter[0].include[0].required = true;
        includeFilter[0].include[0].include[0].required = true;
      }
      
      requireParticipantTraining = true;
    }

    // Step 1: Cari ID yang cocok
    const matched = await Participant.findAll({
      attributes: ["participant_id"],
      where: whereClause,
      include: includeFilter,
    });

    const matchedIds = matched.map(p => p.participant_id);
    if (!matchedIds.length) return [];

    // Reset required ke false untuk query data lengkap
    includeFilter = buildIncludeFilter(filter);
    
    participants = await Participant.findAll({
      where: {
        participant_id: matchedIds,
        ...whereClause,
      },
      include: includeFilter,
      order: [["created_at", "DESC"]],
      ...options,
    });
  }

  // Step Filter participant_training yang training_sesi-nya null
  const result = participants.map(participant => {
    let filteredTrainings = (participant.participant_training || []);
    
    // Filter berdasarkan training_sesi_id jika ada
    if (filter.training_sesi_id) {
      filteredTrainings = filteredTrainings.filter(
        pt => pt.training_sesi !== null && pt.training_sesi.training_sesi_id === filter.training_sesi_id
      );
    }
    // Filter berdasarkan program_training_id jika ada
    else if (filter.program_training_id) {
      filteredTrainings = filteredTrainings.filter(
        pt => pt.training_sesi !== null && 
             pt.training_sesi.program_training !== null &&
             pt.training_sesi.program_training.program_training_id === filter.program_training_id
      );
    }
    // Default filtering untuk kasus lainnya
    else {
      filteredTrainings = filteredTrainings.filter(
        pt => pt.training_sesi !== null
      );
    }

    return {
      ...participant.toJSON(),
      participant_training: filteredTrainings,
    };
  });
  return result;
};

// get partcipant yg blm ambil kelas sesi training
const findNotInTrainingSesi = async (sesiId, options = {}, filter = {}) => {
  const whereClause = { status_deleted: 1 };

  if (filter.search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${filter.search}%` } },
      { agency: { [Op.like]: `%${filter.search}%` } },
      { email: { [Op.like]: `%${filter.search}%` } },
      { domicile: { [Op.like]: `%${filter.search}%` } },
    ];
  }

  // Dapatkan semua participant_id yang sudah mengikuti sesi tertentu
  const participantsInSesi = await ParticipantTraining.findAll({
    attributes: ["participant_id"],
    where: {
      training_sesi_id: sesiId,
    },
  });

  const excludedIds = participantsInSesi.map(p => p.participant_id);

  return await Participant.findAll({
    where: {
      ...whereClause,
      participant_id: {
        [Op.notIn]: excludedIds.length ? excludedIds : [0], // [0] agar tidak mengembalikan semua jika kosong
      },
    },
    include: buildIncludeFilter(filter),
    order: [["created_at", "DESC"]],
    ...options,
  });
};

const countNotInTrainingSesi = async (sesiId, filter = {}) => {
  const whereClause = { status_deleted: 1 };

  if (filter.search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${filter.search}%` } },
      { agency: { [Op.like]: `%${filter.search}%` } },
      { email: { [Op.like]: `%${filter.search}%` } },
      { domicile: { [Op.like]: `%${filter.search}%` } },
    ];
  }

  const participantsInSesi = await ParticipantTraining.findAll({
    attributes: ["participant_id"],
    where: {
      training_sesi_id: sesiId,
    },
  });

  const excludedIds = participantsInSesi.map(p => p.participant_id);

  return await Participant.count({
    where: {
      ...whereClause,
      participant_id: {
        [Op.notIn]: excludedIds.length ? excludedIds : [0],
      },
    },
  });
};

// 3.2 Fungsi count berdasarkan ID hasil filter yang sama
const count = async (filter = {}) => {
  if (filter.participant_id) {
    const count = await Participant.count({
      where: {
        participant_id: filter.participant_id,
        status_deleted: 1,
      },
    });
    return count;
  }

  const whereClause = {
    status_deleted: 1,
  };

  if (filter.search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${filter.search}%` } },
      { agency: { [Op.like]: `%${filter.search}%` } },
      { domicile: { [Op.like]: `%${filter.search}%` } },
      { email: { [Op.like]: `%${filter.search}%` } },
    ];
  }

  const matched = await Participant.findAll({
    attributes: ["participant_id"],
    where: whereClause,
    include: buildIncludeFilter(filter),
  });

  return matched.length;
};

// 5. Update participant
const updateParticipant = async (participant_id, payload, transaction = null) => {
  try {
    const config = {};
    if (transaction) config.transaction = transaction;

    return await Participant.update(payload, {
      where: { participant_id },
      ...config,
    });
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

// 6. Hapus relasi training sebelumnya
const deleteParticipantTraining = async (participant_id, transaction = null) => {
  try {
    const config = {};
    if (transaction) config.transaction = transaction;

    return await ParticipantTraining.destroy({
      where: { participant_id },
      ...config,
    });
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};


module.exports = {
  createParticipantTraining,
  createParticipant,
  findAll,
  count,
  updateParticipant,
  findNotInTrainingSesi,
  countNotInTrainingSesi,
  deleteParticipantTraining,
};
