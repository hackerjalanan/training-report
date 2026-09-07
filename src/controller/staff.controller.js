const staffService = require("../service/staff.service");
const { successResponse } = require("../../utility/success-respon.utility");
const resFormat = require("../../utility/response-api");

// 1. input data staff
const createAccount = async (req, res, next) => {
  try {

    // Panggil service untuk membuat akun baru
    const newStaff = await staffService.create(req);

    // Mengirim response sukses
    return successResponse(res, newStaff, {
      message: "Akun berhasil dibuat.",
      code: 200,
      response_code: "0001",
    });
    
    
  } catch (error) {
    next(error);  // Pass error ke error handler
  }
};

// 2. get all data staff
const showAll = async (req, res, next) => { 
  try {
    const data = await staffService.getAll(req); 
    
    const permissions = req.permission || {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false
    };

    return successResponse(res, {
      ...data,
      permissions, // ← tambahkan ini
    }, {
      message: "Menampilkan data staff.",
      code: 200,
      response_code: "0001",
    });

  } catch (error) {
    next(error);
  }
};

// 3. update data staff
const update = async (req, res, next) => { 
  try {
      const data = await staffService.update(req); 
      return successResponse(res, data, {
        message: "data staff diupdate.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};

// 4. softdelete data staff
const softDelete = async (req, res, next) => { 
  try {
      const data = await staffService.softDelete(req); 
      return successResponse(res, data, {
        message: "data staff dihapus.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};

module.exports = {
  createAccount,
  showAll,
  update,
  softDelete,
};

