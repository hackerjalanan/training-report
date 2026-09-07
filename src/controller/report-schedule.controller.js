const ReportScheduleService = require("../service/report-schedule.service");
const { successResponse } = require("../../utility/success-respon.utility");
const resFormat = require("../../utility/response-api");

// 1. input data report schedule
const createmeeting = async (req, res, next) => {
  try {

    // Panggil service untuk membuat meting baru
    const nereportschedule = await ReportScheduleService.createReportSchedule(req, res, next);

    // Mengirim response sukses
    return successResponse(res, nereportschedule, {
      message: "report schedule berhasil dibuat.",
      code: 200,
      response_code: "0001",
    });
    
    
  } catch (error) {
    next(error);  // Pass error ke error handler
  }
};

// 2. get all data report schedule
const showAll = async (req, res, next) => { 
  try {
    const data = await ReportScheduleService.getAllReportSchedules(req); 
    
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
      message: "Menampilkan data report schedule.",
      code: 200,
      response_code: "0001",
    });

  } catch (error) {
    next(error);
  }
};

// 3. update data report schedule
const update = async (req, res, next) => { 
  try {
    const data = await ReportScheduleService.updateReportSchedule(req); 
    return successResponse(res, data, {
      message: "Data report schedule berhasil diupdate.",
      code: 200,
      response_code: "0001",
    });
  } catch (error) {
    next(error);
  }
};


// 4. remove data report schedule
const remove = async (req, res, next) => { 
  try {
      const data = await ReportScheduleService.deleteReportSchedule(req); 
      return successResponse(res, data, {
        message: "data report schedule dihapus.",
        code: 200,
        response_code: "0001",
      });
  } catch (error) {
      next(error);
  }
};


// 5. get all data report schedule
const showAllmeeting = async (req, res, next) => { 
  try {
    const data = await ReportScheduleService.getMeetingsByTrainingSesiId(req); 
    
    return successResponse(res, data,{
      message: "Menampilkan data report schedule.",
      code: 200,
      response_code: "0001",
    });

  } catch (error) {
    next(error);
  }
};

// 6. get all data report schedule
const getUnusedReportTypesByMeeting = async (req, res, next) => { 

  try {
    const data = await ReportScheduleService.getUnusedReportTypesByMeeting(req); 
 

    return successResponse(res,data
    , {
      message: "Menampilkan data report type.",
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
  showAllmeeting,
  getUnusedReportTypesByMeeting,

};

