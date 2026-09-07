// +satff.validation.js

// import funtion
const { InvalidParameterError } = require("../../error/invalid-parameter.error");
const staffRepo = require("../repository/staff.repository");

// 1. cek duplikat email username
const checkStaff = async (email, username, staff_id = null) => {
  const existingEmail = await staffRepo.findByEmail(email);
  if (existingEmail && existingEmail.staff_id !== staff_id) {
    throw new InvalidParameterError("Email sudah terdaftar.");
  }

  const existingUsername = await staffRepo.findByUsername(username);
  if (existingUsername && existingUsername.staff_id !== staff_id) {
    throw new InvalidParameterError("Username sudah terdaftar.");
  }
};

module.exports = {
    checkStaff
  };
  