const roleRepository = require("../repository/master-data.repository");
const { AuthenticationError } = require("../../error/authentication.error");
const { NotFoundError } = require("../../error/not-found.error");

const { Op } = require('sequelize');

// 1. dropdown role
const fetchRoleList = async () => {
  try {
    const data = await roleRepository.getAllRoles();
    return  data;
  } catch (error) {
    console.error(error);
    throw new NotFoundError();
  }
};

// 2. dropdown program training
const fetchPTList = async (req) => {
  try {
    
    const data = await roleRepository.getAllProgramTraining(req);
    return  data;
  } catch (error) {
    console.error(error);
    throw new NotFoundError();
  }
};

// 3. dropdown Training sesi
const fetchRTList = async () => {
  try {
    const data = await roleRepository.getAllReportType();
    return  data;
  } catch (error) {
    console.error(error);
    throw new NotFoundError();
  }
};

// 4. dropdown Training sesi
const fetchRCList = async (req) => {
  try {

    const idRT = req.params.report_type_id
    const data = await roleRepository.getAllReportContent(idRT);
    return  data;
  } catch (error) {
    console.error(error);
    throw new NotFoundError();
  }
};

// 5. dropdown Training sesi
const fetchTSList = async () => {
  try {
    const data = await roleRepository.getAllTrainingSesi();
    return  data;
  } catch (error) {
    console.error(error);
    throw new NotFoundError();
  }
};

// 6. get staff and role
const getByIdtaff = async (req) => {
  try {
    const staff_id = req.query.staff_id || null;
    const role_id = req.query.role_id || null;

    const data = await roleRepository.getByIdStaff({ staff_id, role_id });
    return data;
  } catch (error) {
    console.error("Error in getByIdStaff:", error);
    throw new NotFoundError("Staff tidak ditemukan");
  }
};

// 1.2. dropdown Training sesi
const fetchDeadlineTSList = async (req) => {
  try {
    const staff_id = req.staff_id;
    
    // Validasi parameter
    if (!staff_id) {
      throw new AuthenticationError("Staff ID is required");
    }

    // Panggil repository function yang sudah diupdate
    const data = await roleRepository.getScheduleTrainingSesi(staff_id);

    // Cek apakah data ditemukan
    if (!data || data.length === 0) {
      return data || []
    }

    // Format response jika diperlukan
    const formattedData = data.map(trainingSesi => ({
      training_sesi_id: trainingSesi.training_sesi_id,
      name: trainingSesi.name || trainingSesi.training_name,
      description: trainingSesi.description,
      start_date: trainingSesi.start_date,
      end_date: trainingSesi.end_date,
      status: trainingSesi.status_active,
      // Tambahkan field lain sesuai kebutuhan
    }));

    return  formattedData;


  } catch (error) {
    console.error("Error in fetchDeadlineTSList:", error);
    
    // Handle different types of errors
    if (error instanceof AuthenticationError) {
      throw error;
    } else if (error instanceof NotFoundError) {
      throw new NotFoundError("Gagal mengambil data training sesi");
    } else {
      throw new NotFoundError("Terjadi kesalahan saat mengambil data");
    }
  }
};

//  1.3 schedule report list
const fetchreportscheduleList = async (req) => {
  try {

    const {training_sesi_id} = req.params
    const data = await roleRepository.getReportScheduleByTrainingSesi(training_sesi_id);
    return  data;
  } catch (error) {
    console.error(error);
    throw new NotFoundError();
  }
};

module.exports = {
  fetchRoleList,
  getByIdtaff,
  fetchPTList,
  fetchTSList,
  fetchRTList,
  fetchRCList,


  fetchDeadlineTSList,
  fetchreportscheduleList,
};
