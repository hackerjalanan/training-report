//report.controller.js
const resFormat = require("../../utility/response-api");
const reportService = require("../service/report.service");
const participantService = require("../service/participant.service");
const { successResponse } = require("../../utility/success-respon.utility");
const { sendFileFromBase64Txt } = require('../../utility/base-sixfour-view.utility');

//libery
const path = require('path');
const fs = require('fs').promises;

// Show all reports
const showAll = async (req, res, next) => {
  try {
    const data = await reportService.getAll(req);

      const permissions = req.permission || {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      canAprove: false,
      canAproveDorektur: false
    };

    return successResponse(res, {permissions, ...data}, {
      message: "Menampilkan data laporan.",
      code: 200,
      response_code: "0001",
    });
  } catch (error) {
    next(error);
  }
};

// 2. input data report
const create = async (req, res, next) => {
  try {
    const data = await reportService.create(req);
    return successResponse(res, data, {
        message: "data report disimpan.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
    next(error);
  }
};

// 3. update data report
const update = async (req, res, next) => {
  try {
    const data = await reportService.update(req);
    return successResponse(res, data, {
        message: "data report berhasil diubah.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
    next(error);
  }
};

// 4. update data report
const softdelete = async (req, res, next) => {
  try {
    const data = await reportService.softdelete(req);
    return successResponse(res, data, {
        message: "data report disimpan.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
    next(error);
  }
};

// show base64
const showBase = async (req, res, next) => {
  try {
    const fileName = req.params.fileName;

    if (!/^[a-z0-9-]+\.txt$/i.test(fileName)) {
      return res.status(400).send('Invalid file name');
    }

    const data = await sendFileFromBase64Txt(fileName);
    return successResponse(res, data, {
      message: "Menampilkan data laporan.",
      code: 200,
      response_code: "0001",
    });
  } catch (error) {
    console.error('showBase error:', error);
    next(error);
  }
};

module.exports = {
  update,
  create,
  showAll,
  showBase,
  softdelete,
};
