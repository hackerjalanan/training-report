const express = require("express");
const router = express.Router();
const participantController = require("../src/controller/participant.controller");
const trainingSesiController = require("../src/controller/training-sesi.controller");
const presentController = require("../src/controller/present.controller");
const { validationRole } = require('../middleware/staff.middleware');
const { injectParticipantCrudPermission , injectSesiTrainingCrudPermission , injectPresentPermission} = require('../middleware/permision.middleware');

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


// 1. Route for participant maintenance 
const gParticipant = `participant/${v1}`;
router.post(`/${gParticipant}/list`, validationAllRole, injectParticipantCrudPermission, participantController.showAll);
router.post(`/${gParticipant}/create`, validationRole([Admin]), participantController.create);
router.patch(`/${gParticipant}/update/:participant_id`, validationRole([Admin]), participantController.update);
router.patch(`/${gParticipant}/deleted/:participant_id`, validationRole([Admin]), participantController.softDelete);

// 2. Route for training-sesi maintenance
const gTraining = `training-sesi/${v1}`;
router.post(`/${gTraining}/list`,validationAllRole, injectSesiTrainingCrudPermission, trainingSesiController.showAll);
router.post(`/${gTraining}/create`, validationRole([Admin]), trainingSesiController.create);
router.patch(`/${gTraining}/update/:training_sesi_id`, validationRole([Admin]), injectParticipantCrudPermission, trainingSesiController.update);
router.patch(`/${gTraining}/deleted/:training_sesi_id`, validationRole([Admin]), injectParticipantCrudPermission, trainingSesiController.softDelete);

const gPresensi = `present/${v1}`;
router.post(`/${gPresensi}/list`, validationAllRole, injectPresentPermission, presentController.getPresenceSummary);
router.post(`/${gPresensi}/meeting`, validationAllRole, injectPresentPermission, presentController.getMeetingParticipants);
router.post(`/${gPresensi}/save`, validationAllRole, injectPresentPermission, presentController.savePresent);

router.post(`/${gPresensi}/dropdown-meeting`, validationAllRole, injectPresentPermission, presentController.showDropdownMeeting);

module.exports = router;
