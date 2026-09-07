const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const authController = require("../src/controller/auth.controller");
const { validationRole, verifyToken  } = require('../middleware/staff.middleware');

const router = express.Router();

// Role constants
const Direktur = 1;
const Manager = 2;
const Supervisor = 3;
const Trainer = 4;
const Admin = 5;

const ALL_ROLES = [Direktur, Manager, Supervisor, Trainer, Admin];
const validationAllRole = validationRole(ALL_ROLES);

// Menentukan service API
const v1 = "v1";
const grup = `/auth/${v1}`;

// ✅ Gunakan captcha middleware pada login
router.post(`${grup}/login`, authController.login);

router.post(`${grup}/logout`, authMiddleware.tokenvalidation, authController.logout);
router.get(`${grup}/profil`, authMiddleware.tokenvalidation, authController.getUserProfile);

router.post(`${grup}/send-otp`, authController.sendotp);
router.post(`${grup}/send-otp-update`, validationAllRole, authController.sendOTPupdatePW);
router.post(`${grup}/verify-otp`, authController.verifyotp);
router.patch(`${grup}/reset-password`, verifyToken , authController.updatePassword);
router.patch(`${grup}/update-password`, validationAllRole , authController.updatePasswordUpdate);

module.exports = router;
