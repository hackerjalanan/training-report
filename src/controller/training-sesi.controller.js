const trainingService = require("../service/training-sesi.service");
const { successResponse } = require("../../utility/success-respon.utility");
const resFormat = require("../../utility/response-api");

// 1. input data training sesi
const create = async (req, res, next) => {
  try {
    
    // Panggil service untuk membuat akun baru
    const newStaff = await trainingService.create(req);

    // Mengirim response sukses
    return successResponse(res, newStaff, {
      message: "data training sesi berhasil dibuat.",
      code: 200,
      response_code: "0001",
    });
    
  } catch (error) {
    next(error);  
  }
};

// 2. get all data training sesi
const showAll = async (req, res, next) => { 
  try {
    const data = await trainingService.showAll(req); 

    const permissions = req.permission || {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false
    };

    return successResponse(res, {permissions,  ...data}, {
      message: "menampilkan data training sesi.",
      code: 200,
      response_code: "0001",
    });
  } catch (error) {
      next(error);
  }
};

// 3. update data training sesi
const update = async (req, res, next) => { 
  try {
      const data = await trainingService.update(req); 
      return successResponse(res, data, {
        message: "data training sesi diupdate.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};

// 4. update soft delete training id
const softDelete = async (req, res, next) => { 
  try {
      const data = await trainingService.softDelete(req); 
      return successResponse(res, data, {
        message: "data training sesi dihapus.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};


module.exports = {
  showAll,
  create,
  update,
  softDelete,
};

