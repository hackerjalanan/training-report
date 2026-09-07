// participant.service.js

// #libery import
const bcrypt = require("bcrypt");
const { v7: uuidv7 } = require('uuid');

// exception import
const { QueryError } = require("sequelize");
const { NotFoundError } = require("../../error/not-found.error");
const { InvalidParameterError } = require("../../error/invalid-parameter.error");
const {sequelize} = require("../../connection/mysql.connection");

// funtion import----------
const  participantRepo = require("../repository/participant.repository")
const { getMetadataInfo } = require('../../utility/metadata-info.utility'); 
const { getPaginationOffset } = require("../../utility/pagination.utility");

// 1. created participant
const create = async (req) => {
  const t = await sequelize.transaction(); // tambahkan transaksi
  try {

    const payload = req.body;

    // Validasi sederhana
    if (!payload.name || !payload.agency || !Array.isArray(payload.training_sesi_ids)) {
      await t.rollback(); // rollback jika validasi gagal
      throw new Error("Field name, agency, dan training_sesi_ids wajib diisi.");
    }

    const timestamp = new Date();
    const participantId = uuidv7();

    const participantData = {
      participant_id: participantId,
      name: payload.name,
      agency: payload.agency,
      domicile: payload.email,
      email: payload.email,
      status_deleted: 1,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const participant = await participantRepo.createParticipant(participantData, t);

    const trainingEntries = payload.training_sesi_ids.map((trainingSesiId) => ({
      participant_training_id: uuidv7(),
      participant_id: participantId,
      training_sesi_id: trainingSesiId,
      created_at: timestamp,
    }));

    await participantRepo.createParticipantTraining(trainingEntries, t);

    await t.commit();
    return participant;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// 2. showAll participant
const showAll = async (req) => {
  const pageNumber = parseInt(req.body.batch, 10) || 1;
  const pageSize = parseInt(req.body.size, 10) || 10;

  const options = {
    offset: getPaginationOffset(pageNumber, pageSize),
    limit: pageSize,
  };

  const filter = {
    search: req.body.search?.trim() || undefined,
    training_sesi_id: req.body.training_sesi_id || undefined,
    program_training_id: req.body.program_training_id || undefined,
    participant_id: req.body.participant_id || undefined,
  };

  // Jika permintaan ingin peserta yang belum mengikuti sesi tertentu
  if (req.body.not_sesi_training) {
    const data = await participantRepo.findNotInTrainingSesi(
      req.body.not_sesi_training,
      options,
      filter
    );
    const totalData = await participantRepo.countNotInTrainingSesi(
      req.body.not_sesi_training,
      filter
    );

    const maxPage = Math.ceil(totalData / pageSize);
    return {
      page: {
        total_record_count: totalData,
        maxPage,
        batch_number: pageNumber,
        raw_length: data.length,
        max_raw_size: pageSize,
      },
      records: data,
    };
  }

  // Default
  const data = await participantRepo.findAll(options, filter);
  const totalData = await participantRepo.count(filter);
  const maxPage = Math.ceil(totalData / pageSize);

  return {
    page: {
      total_record_count: totalData,
      maxPage,
      batch_number: pageNumber,
      raw_length: data.length,
      max_raw_size: pageSize,
    },
    records: data,
  };
};

// 3. update sesi trainer
const update = async (req) => {
  const t = await sequelize.transaction();
  try {
    const participant_id = req.params.participant_id;
    const payload = req.body;
    const timestamp = new Date();

    // Cek apakah hanya menambahkan sesi training tambahan
    if (payload.only_sesi_training_id && !payload.name && !payload.agency && !payload.email && !payload.domicile && !payload.training_sesi_ids) {
      const newTraining = {
        participant_training_id: uuidv7(),
        participant_id,
        training_sesi_id: payload.only_sesi_training_id,
        created_at: timestamp,
      };

      await participantRepo.createParticipantTraining([newTraining], t);
      await t.commit();
      return { message: "Sesi training tambahan berhasil ditambahkan" };
    }

    // Default flow: update participant & relasi training
    const updateData = {
      name: payload.name,
      agency: payload.agency,
      email: payload.email,
      domicile: payload.domicile,
      updated_at: timestamp,
    };

    // 1. Update participant
    await participantRepo.updateParticipant(participant_id, updateData, t);

    // 2. Hapus relasi sebelumnya
    await participantRepo.deleteParticipantTraining(participant_id, t);

    // 3. Tambahkan ulang relasi training
    const newTrainings = payload.training_sesi_ids.map((trainingSesiId) => ({
      participant_training_id: uuidv7(),
      participant_id,
      training_sesi_id: trainingSesiId,
      created_at: timestamp,
    }));

    await participantRepo.createParticipantTraining(newTrainings, t);

    await t.commit();
    return { message: "Update berhasil" };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};


// 4. delete (soft-delete)
const softDelete = async (req) => {
  const t = await sequelize.transaction();
  try {
    const participant_id = req.params.participant_id;
    const timestamp = new Date();

    const updateData = {
      status_deleted: 0,
      updated_at: timestamp,
    };

    // 1. Update stastus_deleted participant
    await participantRepo.updateParticipant(participant_id, updateData, t);

    await t.commit();
    return { message: " deleted berhasil" };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};



module.exports = {
  create,
  update,
  showAll,
  softDelete,
};
