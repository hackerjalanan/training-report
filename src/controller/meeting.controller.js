const meetingService = require("../service/meeting.service");
const { successResponse } = require("../../utility/success-respon.utility");
const resFormat = require("../../utility/response-api");

// 1. input data meeting
const createmeeting = async (req, res, next) => {
  try {

    // Panggil service untuk membuat meting baru
    const newmeeting = await meetingService.create(req, res, next);

    // Mengirim response sukses
    return successResponse(res, newmeeting, {
      message: "meeting berhasil dibuat.",
      code: 200,
      response_code: "0001",
    });
    
    
  } catch (error) {
    next(error);  // Pass error ke error handler
  }
};

// 2. get all data meeting
const showAll = async (req, res, next) => { 
  try {
    const data = await meetingService.getAll(req); 
    
    const permissions = req.permission || {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false
    };

    return successResponse(res, {
      permissions,
      ...data,
    }, {
      message: "Menampilkan data meeting.",
      code: 200,
      response_code: "0001",
    });

  } catch (error) {
    next(error);
  }
};

// 3. update data meeting
const update = async (req, res, next) => { 
  try {
    const data = await meetingService.update(req); 
    return successResponse(res, data, {
      message: "Data meeting berhasil diupdate.",
      code: 200,
      response_code: "0001",
    });
  } catch (error) {
    next(error);
  }
};


// 4. remove data meeting
const remove = async (req, res, next) => { 
  try {
      const data = await meetingService.remove(req); 
      return successResponse(res, data, {
        message: "data meeting dihapus.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};

module.exports = {
  createmeeting,
  showAll,
  update,
  remove,
};

