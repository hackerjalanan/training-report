// meeting.service.js - Fixed for the Meeting model
const { v7: uuidv7 } = require('uuid');
const db = require('../../connection/mysql.connection');
const meetingRepo = require("../repository/meeting.repository");
const { NotFoundError } = require("../../error/not-found.error");
const { InvalidParameterError } = require("../../error/invalid-parameter.error");
const { QueryError } = require("../../error/query.error");

const create = async (req) => {
  const { training_sesi_id, name, start_date, end_date } = req.body;
  const transaction = await db.sequelize.transaction();

  try {
    // Validasi input
    if (!training_sesi_id || !name || !start_date || !end_date) {
      throw new InvalidParameterError("Semua field wajib diisi.");
    }

    // Validasi format tanggal
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new InvalidParameterError("Format tanggal tidak valid.");
    }

    if (startDate >= endDate) {
      throw new InvalidParameterError("Tanggal mulai harus lebih kecil dari tanggal selesai.");
    }

    const data = {
      meeting_id: uuidv7(),
      training_sesi_id,
      name,
      start_date: startDate,
      end_date: endDate,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const created = await meetingRepo.create(data, transaction);
    await transaction.commit();
    return created;
  } catch (error) {
    await transaction.rollback();
    
    if (error instanceof InvalidParameterError || 
        error instanceof NotFoundError || 
        error instanceof QueryError) {
      throw error;
    }
    
    throw new QueryError(`Database operation failed: ${error.message}`);
  }
};

const getAll = async (req) => {
  try {
    const {
      meeting_id,
      search = null,
      batch,
      size,
      training_sesi_id,
    } = req.body;

    // Set default values dan validasi pagination parameters
    let batchNum = null;
    let sizeNum = null;

    // Jika batch disediakan, validasi dan parse
    if (batch !== undefined && batch !== null) {
      batchNum = parseInt(batch);
      if (isNaN(batchNum) || batchNum < 1) {
        throw new InvalidParameterError("Parameter batch harus berupa angka positif.");
      }
    } else {
      // Set default value jika tidak disediakan
      batchNum = 1;
    }

    // Jika size disediakan, validasi dan parse
    if (size !== undefined && size !== null) {
      sizeNum = parseInt(size);
      if (isNaN(sizeNum) || sizeNum < 1 || sizeNum > 100) {
        throw new InvalidParameterError("Parameter size harus berupa angka antara 1-100.");
      }
    } else {
      // Set default value jika tidak disediakan
      sizeNum = 5;
    }

    const repoFilter = {
      meeting_id,
      search,
      batch: batchNum,
      size: sizeNum,
      training_sesi_id,
    };

    return await meetingRepo.findAll(repoFilter);
  } catch (error) {
    if (error instanceof InvalidParameterError || error instanceof QueryError) {
      throw error;
    }
    throw new QueryError(`Failed to retrieve meetings: ${error.message}`);
  }
};

const update = async (req) => {
  const { id } = req.params;
  const { name, start_date, end_date } = req.body;
  const transaction = await db.sequelize.transaction();

  try {
    // Validasi input
    if (!name || !start_date || !end_date) {
      throw new InvalidParameterError("Field name, start_date, dan end_date wajib diisi.");
    }

    // Validasi format tanggal
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new InvalidParameterError("Format tanggal tidak valid.");
    }

    if (startDate >= endDate) {
      throw new InvalidParameterError("Tanggal mulai harus lebih kecil dari tanggal selesai.");
    }

    // Cek apakah data meeting ada
    const existing = await meetingRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Data meeting tidak ditemukan.");
    }

    // Lakukan update dengan transaction
    const affectedRows = await meetingRepo.update(
      {
        name,
        start_date: startDate,
        end_date: endDate,
        updated_at: new Date(),
      },
      { meeting_id: id },
      transaction
    );

    if (affectedRows === 0) {
      throw new QueryError("Tidak ada data yang diperbarui.");
    }

    // Ambil data setelah update
    const updatedMeeting = await meetingRepo.findById(id);

    await transaction.commit();

    return {
      success: true,
      message: "Meeting berhasil diupdate.",
      data: updatedMeeting,
    };
  } catch (error) {
    await transaction.rollback();
    
    if (error instanceof InvalidParameterError || 
        error instanceof NotFoundError || 
        error instanceof QueryError) {
      throw error;
    }
    
    throw new QueryError(`Update operation failed: ${error.message}`);
  }
};

const remove = async (req) => {
  const { id } = req.params;
  const transaction = await db.sequelize.transaction();

  try {
    // Cek apakah data meeting ada
    const existing = await meetingRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Data meeting tidak ditemukan.");
    }

    const deletedRows = await meetingRepo.destroy(id, transaction);
    
    if (deletedRows === 0) {
      throw new QueryError("Tidak ada data yang dihapus.");
    }

    await transaction.commit();
    return { 
      success: true,
      message: "Data meeting berhasil dihapus" 
    };
  } catch (error) {
    await transaction.rollback();
    
    if (error instanceof NotFoundError || error instanceof QueryError) {
      throw error;
    }
    
    throw new QueryError(`Delete operation failed: ${error.message}`);
  }
};

module.exports = {
  create,
  getAll,
  update,
  remove,
};