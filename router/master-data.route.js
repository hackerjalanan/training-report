const express = require("express");
const router = express.Router();
const masterDataController = require("../src/controller/master-data.controller");
const reporContentController = require("../src/controller/report-type.controller");
const meetingController = require("../src/controller/meeting.controller");
const reportScheduleController = require("../src/controller/report-schedule.controller");
const { validationRole } = require('../middleware/staff.middleware');
const { injectReportTypeCrudPermission , injectSesiTrainingCrudPermission, injectSesiReportScheduleCrudPermission} = require('../middleware/permision.middleware');

// Endpoint untuk membuat akun
const v1 = "v1";

// Role constants
const Direktur = 1;
const Manager = 2;
const Supervisor = 3;
const Trainer = 4;
const Admin = 5;


// Role yang diizinkan untuk seluruh akses (all)
const ALL_ROLES = [Direktur, Manager, Supervisor, Trainer, Admin];
// Reusable middleware
const validationAllRole = validationRole(ALL_ROLES);


// master data
const gMaster = `master-data/${v1}`; // Menggunakan backtick untuk template literal
router.get(`/${gMaster}/role`, validationAllRole,  masterDataController.showAllrole);
router.get(`/${gMaster}/report-type`, validationAllRole, masterDataController.showAllReportType);
router.get(`/${gMaster}/training-sesi`, validationAllRole, masterDataController.showAlltrainingsesi);
router.get(`/${gMaster}/training-schedule-report`, validationAllRole, masterDataController.showDedadlinetrainingsesi);
router.get(`/${gMaster}/schedule-report/:training_sesi_id`, validationAllRole, masterDataController.scheduleReportNType);
router.get(`/${gMaster}/report-content/:report_type_id`, validationAllRole, masterDataController.showAllReportcontent);
router.get(`/${gMaster}/program-training/:program_training_id?`, validationAllRole, masterDataController.showAllprogramtraining);
router.get(`/${gMaster}/staff-id/:staff_id?`, validationAllRole, masterDataController.shorwByIdStaff);

// master data report conteent
const gReportType = `report-type/${v1}`; // Menggunakan backtick untuk template literal
router.post(`/${gReportType}/list`, validationRole([Supervisor]), injectReportTypeCrudPermission, reporContentController.showAll);
router.post(`/${gReportType}/create`, validationRole([Supervisor]),  reporContentController.create);
router.patch(`/${gReportType}/update/:report_type_id`, validationRole([Supervisor]),  reporContentController.update);
router.patch(`/${gReportType}/deleted/:report_type_id`, validationRole([Supervisor]),  reporContentController.hardDelete);


// master data meeting
const gMeeting = `meeting/${v1}`; // Menggunakan backtick untuk template literal
router.post(`/${gMeeting}/list`, validationAllRole, injectSesiTrainingCrudPermission, meetingController.showAll);
router.post(`/${gMeeting}/create`, validationRole([Admin]),  meetingController.createmeeting);
router.patch(`/${gMeeting}/update/:id`, validationRole([Admin]),  meetingController.update);
router.patch(`/${gMeeting}/deleted/:id`, validationRole([Admin]),  meetingController.remove);

// master data report schedule
const gReportSchedule = `report-schedule/${v1}`; // Menggunakan backtick untuk template literal
router.post(`/${gReportSchedule}/list`, validationAllRole, injectSesiReportScheduleCrudPermission, reportScheduleController.showAll);
router.post(`/${gReportSchedule}/create`, validationRole([Supervisor]),  reportScheduleController.createmeeting);
router.patch(`/${gReportSchedule}/update/:id`, validationRole([Supervisor]),  reportScheduleController.update);
router.patch(`/${gReportSchedule}/deleted/:id`, validationRole([Supervisor]),  reportScheduleController.remove);
router.post(`/${gReportSchedule}/show-meeting`, validationRole([Supervisor]),  reportScheduleController.showAllmeeting);
router.post(`/${gReportSchedule}/show-type-report`, validationRole([Supervisor]),  reportScheduleController.getUnusedReportTypesByMeeting);

module.exports = router;
