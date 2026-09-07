const express = require("express");
const router = express.Router();
const staffController = require("../src/controller/staff.controller");
const masterDataController = require("../src/controller/master-data.controller");
const trainingSesiController = require("../src/controller/training-sesi.controller");
const { validationRole } = require('../middleware/staff.middleware');
const { injectStaffCrudPermission, injectSesiTrainingCrudPermission } = require('../middleware/permision.middleware');

// Endpoint untuk membuat akun
const v1 = "v1";
const gStaff = `staff/${v1}`; // Menggunakan backtick untuk template literal
const gMaster = `master-data/${v1}`; // Menggunakan backtick untuk template literal

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

// Route untuk manajemen staff
router.post(`/${gStaff}/create`, validationRole([Manager]), injectStaffCrudPermission, staffController.createAccount);
router.patch(`/${gStaff}/update/:staff_id`, validationRole([Manager]), injectStaffCrudPermission, staffController.update);
router.patch(`/${gStaff}/deleted/:staff_id`, validationRole([Manager]), injectStaffCrudPermission, staffController.softDelete);
router.post(`/${gStaff}/list`,  validationRole([Manager, Supervisor, Direktur]),  injectStaffCrudPermission, staffController.showAll);

module.exports = router;
