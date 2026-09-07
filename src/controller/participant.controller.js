// participant.controller.js

const participantService = require("../service/participant.service");
const { successResponse } = require("../../utility/success-respon.utility");
const resFormat = require("../../utility/response-api");

// 1. input data participant
const create = async (req, res, next) => {
  try {
    const data = await participantService.create(req);
    return successResponse(res, data, {
        message: "data participant disimpan.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
    next(error);
  }
};

// 2. get all data participant
const showAll = async (req, res, next) => { 
  try {
    const data = await participantService.showAll(req); 
    
    const permissions = req.permission || {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false
    };

    return successResponse(res, { permissions, ...data}, {
      message: "Menampilkan data participant.",
      code: 200,
      response_code: "0001",
    });
  } catch (error) {
      next(error);
  }
};

// 4. update data participant + training sesi
const update = async (req, res, next) => { 
  try {
      const data = await participantService.update(req); 
      return successResponse(res, data, {
        message: "data participant diupdate.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};

// 5. update data staff
const softDelete = async (req, res, next) => { 
  try {
      const data = await participantService.softDelete(req); 
      return successResponse(res, data, {
        message: "data participant dihapus.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};


module.exports = {
  create,
  showAll,
  update,
  softDelete,
};

