const express = require("express");
const router = express.Router();
const reportController = require('../src/controller/report.controller');
const statscController = require('../src/controller/statistic.controller');
const reportDashboard = require('../src/controller/dashboard.controller');
const { validationRole } = require('../middleware/staff.middleware');
const { injectReportCrudPermission } = require('../middleware/permision.middleware');

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

// Route for participant maintenance 
const gReport = `report/${v1}`;
router.post(`/${gReport}/list`, validationAllRole, injectReportCrudPermission, reportController.showAll);
router.post(`/${gReport}/create`, validationRole([Trainer]), reportController.create);
router.patch(`/${gReport}/update/:report_id`, validationRole([Manager, Direktur, Supervisor, Trainer] ), reportController.update);
router.patch(`/${gReport}/deleted/:report_id`, validationRole([Manager, Supervisor, Trainer]), reportController.softdelete);
router.get(`/${gReport}/attachment/:fileName`, validationAllRole, reportController.showBase);


// dashboard
const gDashboard= `dashboard/${v1}`;
router.get(`/${gDashboard}/activity`, validationAllRole, reportDashboard.showAllActivity);
router.get(`/${gDashboard}/total-training`, validationAllRole, reportDashboard.fetchPTList);

// grafik
const gGrafik= `grafik/${v1}`;
router.get(`/${gGrafik}/training`, validationAllRole, reportDashboard.fetchTrainingGraph);

//statsc
const gStatc = `statc/${v1}`; // kamu bisa ubah ini sesuai dengan kebutuhan path utama
router.get(`/${gStatc}/training`, validationAllRole, statscController.getStatc);
router.get(`/${gStatc}/trainer`, validationAllRole, statscController.getStatcByTraining);
router.post(`/${gStatc}/total-report`, validationAllRole, statscController.totalPersen);

module.exports = router;
