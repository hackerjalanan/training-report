const reportTypeService = require("../service/report-type.service");
const { successResponse } = require("../../utility/success-respon.utility");
const resFormat = require("../../utility/response-api");


// 1. input data training sesi
const create = async (req, res, next) => {
  try {
    
    // Panggil service untuk membuat akun baru
    const newStaff = await reportTypeService.create(req);

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
    const data = await reportTypeService.showAll(req); 

    const permissions = req.permission || {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false
    };

    return successResponse(res, {permissions,  ...data}, {
      message: "menampilkan data report type",
      code: 200,
      response_code: "0001",
    });
  } catch (error) {
      next(error);
  }
};

// 3. update data report type
const update = async (req, res, next) => { 
  try {
      const data = await reportTypeService.update(req); 
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
const hardDelete = async (req, res, next) => { 
  try {
      const data = await reportTypeService.deleteReportTypeWithContents(req); 
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
  hardDelete,
};

