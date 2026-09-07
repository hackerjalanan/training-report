const presentService = require('../service/present.service');
const { successResponse } = require("../../utility/success-respon.utility");
const resFormat = require("../../utility/response-api");

const getPresenceSummary = async (req, res, next) => {
  try {
    const data = await presentService.getParticipantsByTrainingSession(req);
    
    return successResponse(res, data, {
      message: "Presence summary retrieved successfully.",
      code: 200,
      response_code: "0001",
    });
  } catch (error) {
    next(error);
  }
};

const getMeetingParticipants = async (req, res, next) => {
  try {
    const data = await presentService.getParticipantsByMeetingSession(req);
    
    return successResponse(res, data, {
      message: "All participants retrieved successfully.",
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

const savePresent = async (req, res, next) => {
  try {
    const data = await presentService.create(req);

    return successResponse(res, data, {
      message: "Presence saved successfully.",
      code: 201,
      response_code: "0001",
    });
  } catch (error) {
    next(error);
  }
};



// get all data meeting
const showDropdownMeeting = async (req, res, next) => { 
  try {
    const data = await presentService.getDropdownMeeting(req); 
    
  
    return successResponse(res,  data, {
      message: "Menampilkan data meeting.",
      code: 200,
      response_code: "0001",
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  getPresenceSummary,
  getMeetingParticipants,
  savePresent,
  showDropdownMeeting
};