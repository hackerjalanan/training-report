// training-sesi.service.js

// #libery import
const bcrypt = require("bcrypt");
const { v7: uuidv7 } = require('uuid');

// funtion import
const { QueryError } = require("sequelize");
const { NotFoundError } = require("../../error/not-found.error");
const { getMetadataInfo } = require('../../utility/metadata-info.utility'); 
const { getPaginationOffset } = require("../../utility/pagination.utility");
const  trainingSesiRepo = require("../repository/training-sesi.repository");
const { InvalidParameterError } = require("../../error/invalid-parameter.error");


// import connect
const db = require('../../connection/mysql.connection'); 


// 1. created training sesi
const create = async (req) => {
  try {
    const {
      program_training_id,
      name,
      location,
      meeting_mode,
      start_date,
      end_date,
      staff_id,
    } = req.body;

    if (!program_training_id || !name || !meeting_mode || !location || !start_date) {
      throw new InvalidParameterError("Semua field wajib diisi");
    }

    const trainingSesiPayload = {
      training_sesi_id: uuidv7(),
      program_training_id,
      name,
      location,
      meeting_mode,
      end_date,
      start_date,
      staff_id,
      status_active: 'no active',
      status_deleted: 1,
      created_at: new Date(),
    };

    const newTrainingSesi = await trainingSesiRepo.create(trainingSesiPayload);
    return newTrainingSesi;
  } catch (error) {
    throw new InvalidParameterError("Gagal membuat sesi pelatihan: " + error.message);
  }
};


// 2. showAll training sesi
const showAll = async (req) => {
  try {
    const {
      training_sesi_id = "",
      search = "",
      batch = 1,
      size = 5,
      start_date,
      end_date,
      status_active,
    } = req.body;

    const role_id = req.role_id;         // pastikan role_id dikirim dari auth/session
    const staff_id = req.staff_id;   // pastikan staff_id dikirim atau diketahui dari auth

    // Bangun filter awal
    const filter = {
      training_sesi_id,
      search,
      start_date: start_date || undefined,
      end_date: end_date || undefined,
      status_active,
      batch,
      size,
    };

    // Jika role_id adalah 4 (trainer), tambahkan filter berdasarkan staff_id
    if (role_id === 4 && staff_id) {
      filter.staff_id = staff_id;
    }

    const result = await trainingSesiRepo.findAll(filter);
    return result;

  } catch (error) {
    throw new InvalidParameterError("Gagal mengambil data sesi pelatihan: " + error.message);
  }
};


// 3. update sesi trainer
const update = async (req) => {
  const training_sesi_id = req.params.training_sesi_id;
  const body = req.body;

  // Mulai transaksi
  const transaction = await db.sequelize.transaction();

  try {
    // Ambil metadata (misalnya waktu dan user login)
    const { currentDatetime } = getMetadataInfo(req);

    // Buat payload update
    const payload = {
      name: body.name ?? null,
      program_training_id: body.program_training_id ?? null,
      meeting_mode: body.meeting_mode ?? null,
      status_deleted: body.status_deleted ?? 1,
      location: body.location ?? null,
      start_date: body.start_date ?? null,
      end_date: body.end_date ?? null,          // ditambahkan
      staff_id: body.staff_id ?? null,      // ditambahkan
      created_at: currentDatetime,
    };

    // Cek apakah data dengan ID tersebut ada dulu
    const existing = await trainingSesiRepo.findById(training_sesi_id);
    if (!existing) {
      throw new NotFoundError(`Training sesi dengan ID '${training_sesi_id}' tidak ditemukan.`);
    }

    // Lakukan update
    await trainingSesiRepo.update(payload, { training_sesi_id }, transaction);

    await transaction.commit();

    return {
      message: "Training sesi berhasil diperbarui.",
      data: {
        training_sesi_id,
        ...payload,
      },
    };

  } catch (error) {
    await transaction.rollback();
    throw new QueryError("Gagal update data: " + error.message);
  }
};


// 4. delete (soft-delete)
const softDelete = async (req) => {
  const trainingSesiId = req.params.training_sesi_id;
  const { only_participant_delete } = req.body;

  // Set transaksi
  const transaction = await db.sequelize.transaction();

  try {
    // Jika hanya ingin menghapus relasi peserta dari sesi
    if (only_participant_delete) {
      const participantId = only_participant_delete;

      const deletedCount = await trainingSesiRepo.deleteByParticipantAndSesi(
        participantId,
        trainingSesiId,
        transaction
      );

      await transaction.commit();

      if (deletedCount === 0) {
        throw new NotFoundError(`Data peserta dengan ID '${participantId}' dalam sesi '${trainingSesiId}' tidak ditemukan.`);
      }

      return { deleted_participant_training: true };
    }

    // Soft delete sesi training
    const { currentDatetime } = getMetadataInfo(req);

    const payload = {
      status_deleted: 0,
      status_active: 'no active',
      created_at: currentDatetime,
    };

    const existing = await trainingSesiRepo.findById(trainingSesiId);
    if (!existing) {
      throw new NotFoundError(`Training sesi dengan ID '${trainingSesiId}' tidak ditemukan.`);
    }

    await trainingSesiRepo.update(payload, { training_sesi_id: trainingSesiId }, transaction);

    await transaction.commit();

    return payload;

  } catch (error) {
    await transaction.rollback(); // rollback on failure
    throw new InvalidParameterError("Gagal menghapus data: " + error.message);
  }
};

const softdeleteclass = async (req) => {
  const dataId = req.params.training_sesi_id;

   // set transaction
   const transaction = await db.sequelize.transaction();

  try {
      // get data 'modified_at' and 'modified_by'
      const { currentDatetime } = getMetadataInfo(req);
  
      const payload = {
        trainingsesiid
      };

      // Cek apakah data dengan ID tersebut ada dulu
      const existing = await trainingSesiRepo.findById(dataId);
      if (!existing) {
        throw new NotFoundError(`Training sesi dengan ID '${dataId}' tidak ditemukan.`);
      }

      // update data by 'account_id'
      await trainingSesiRepo.update(payload, { training_sesi_id: dataId }, transaction);
  
      // commit transaction
      await transaction.commit();

      return payload;    
  } catch (error) {
    throw new InvalidParameterError("Gagal delete akun: " + error.message);
  }
};


module.exports = {
  showAll,
  create,
  update,
  softDelete,
};
