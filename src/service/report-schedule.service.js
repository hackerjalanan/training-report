const { v7: uuidv7 } = require('uuid');

const repository = require("../repository/report-schedule.repository");
const { NotFoundError } = require("../../error/not-found.error");
const { QueryError } = require("../../error/query.error")
const { InvalidParameterError } = require("../../error/invalid-parameter.error") 

//show jadwal
const getAllReportSchedules = async (req) => {
  // Destructuring dari req.body
  const {
    report_schedule_id,
    search,
    batch,
    size,
    training_sesi_id,
  } = req.body;

  const filters = {
    report_schedule_id,
    search,
    batch,
    size,
    training_sesi_id,
  };

  return await repository.getAll(filters);
};

//Show training
const getMeetingsByTrainingSesiId = async (req) => {
  // Destructuring dari req.body
  const {
    training_sesi_id,
  } = req.body;

  return await repository.getMeetingsByTrainingSesiId(training_sesi_id);
};

//show report type
const getUnusedReportTypesByMeeting = async (req) => {
  // Destructuring dari req.body
  const {
    meeting_id,
    report_type_id,
  } = req.body;

  return await repository.getUnusedReportTypesByMeeting(meeting_id, report_type_id);
};

//creat jadwal report
const createReportSchedule = async (req) => {
  const timestamp = new Date();
  const {
    training_sesi_id,
    report_type_id,
    meeting_id,
    start_date,
    end_date,
  } = req.body;

  try {
    // Validasi input
    if (!training_sesi_id || !report_type_id || !start_date || !end_date) {
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

    // Bangun data baru
    const newData = {
      report_schedule_id: uuidv7(),
      training_sesi_id,
      meeting_id,
      report_type_id,
      start_date: startDate,
      end_date: endDate,
      created_at: timestamp,
      updated_at: timestamp,
    };

    return await repository.create(newData);

  } catch (error) {
    // Jika kamu pakai transaction, pastikan didefinisikan dan rollback di sini
    // if (transaction) await transaction.rollback();

    if (
      error instanceof InvalidParameterError ||
      error instanceof NotFoundError ||
      error instanceof QueryError
    ) {
      throw error;
    }

    throw new QueryError(`Database operation failed: ${error.message}`);
  }
};

const updateReportSchedule = async (req) => {
  try {
    const { report_schedule_id, report_type_id, meeting_id, start_date, end_date } = req.body;
    const { id } = req.params;

    // Bangun data yang akan diupdate
    const updatedData = {
      updated_at: new Date(),
    };

    if (report_schedule_id !== undefined) updatedData.report_schedule_id = report_schedule_id;
    if (meeting_id !== undefined) updatedData.meeting_id = meeting_id;
    if (report_type_id !== undefined) updatedData.report_type_id = report_type_id;
    if (start_date !== undefined) updatedData.start_date = new Date(start_date);
    if (end_date !== undefined) updatedData.end_date = new Date(end_date);

    // Validasi tanggal
    if (
      updatedData.start_date &&
      updatedData.end_date &&
      updatedData.start_date >= updatedData.end_date
    ) {
      throw new InvalidParameterError("Tanggal mulai harus lebih kecil dari tanggal selesai.");
    }

    // Panggil repository update
    const result = await repository.update(updatedData, { report_schedule_id: id });

    return {
      message: "Report schedule berhasil diperbarui.",
      updated: result,
    };
  } catch (error) {
    if (error instanceof QueryError || error instanceof InvalidParameterError) {
      throw error;
    }

    throw new QueryError(`Gagal memperbarui data report schedule: ${error.message}`);
  }
};


const deleteReportSchedule = async (req) => {
  const { id } = req.params;
  return await repository.remove(id);
};

module.exports = {
  getAllReportSchedules,
  createReportSchedule,
  updateReportSchedule,
  deleteReportSchedule,
  getMeetingsByTrainingSesiId,
  getUnusedReportTypesByMeeting,
};
