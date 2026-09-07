
const masterData = require("../service/master-data.service");
const { successResponse } = require("../../utility/success-respon.utility");
const resFormat = require("../../utility/response-api");


// 1. get all data role
const showAllrole = async (req, res, next) => { 
  try {
      const data = await masterData.fetchRoleList(req); 
      return successResponse(res, data, {
        message: "menampilkan data role.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};

// 2. get all data participant
const showAllprogramtraining = async (req, res, next) => { 
  try {
      const data = await masterData.fetchPTList(req); 
      return successResponse(res, data, {
        message: "menampilkan data program training.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};

// 2.2 get all data Training Sesi
const showAlltrainingsesi = async (req, res, next) => { 
  try {
      const data = await masterData.fetchTSList(req); 
      return successResponse(res, data, {
        message: "menampilkan data training sesi.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};

// 3. get all data Training Sesi
const showAllReportType = async (req, res, next) => { 
  try {
      const data = await masterData.fetchRTList(req); 
      return successResponse(res, data, {
        message: "menampilkan data report type.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};

// 4. get all data Training Sesi
const showAllReportcontent = async (req, res, next) => { 
  try {
      const data = await masterData.fetchRCList(req); 
      return successResponse(res, data, {
        message: "menampilkan data report content.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};

// 5. get all data Training Sesi
const shorwByIdStaff = async (req, res, next) => { 
  try {
      const data = await masterData.getByIdtaff(req); 
      return successResponse(res, data, {
        message: "menampilkan data staff id.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};

// dropdown report deadline
// 1. get all data participant
const showDedadlinetrainingsesi = async (req, res, next) => { 
  try {
      const data = await masterData.fetchDeadlineTSList(req); 
      return successResponse(res, data, {
        message: "menampilkan data deadline sesi.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};

// 2. get all data schedule report
const scheduleReportNType = async (req, res, next) => { 
  try {
      const data = await masterData.fetchreportscheduleList(req); 
      return successResponse(res, data, {
        message: "menampilkan data deadline sesi.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};

module.exports = {
  showAllrole,
  shorwByIdStaff,
  showAllReportType,
  showAlltrainingsesi,
  scheduleReportNType,
  showAllReportcontent,
  showAllprogramtraining,
  showDedadlinetrainingsesi,
};
