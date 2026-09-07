// const { v7: uuidv7 } = require("uuid");
// const nodemailer = require("nodemailer");
// const { Op } = require("sequelize");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// const db = require("../../connection/mysql.connection");
// const otp_verify = db.otp_verify;
// const staff = db.staff;

// const emailConfig = require("../../config/email.config");
// const { findLogin, findByEmailActive } = require("../repository/auth.repository");
// const errorFormat = require("../../utility/error-format");
// const { AuthenticationError } = require("../../error/authentication.error");
// const { NotFoundError } = require("../../error/not-found.error");

// // fungsi login
// const loginService = async (username, passwordInput) => {
//   try {
//     if (!username || !passwordInput) {
//       throw new AuthenticationError("Username atau password tidak boleh kosong.");
//     }
//     const staff = await findLogin(username);
//     if (!staff) throw new AuthenticationError("Akun tidak ditemukan.");

//     const passwordMatch = await bcrypt.compare(passwordInput, staff.password);
//     if (!passwordMatch) throw new AuthenticationError("Password salah.");

//     const staffData = {
//       staff_id: staff.staff_id,
//       username: staff.username,
//       email: staff.email,
//       name: staff.name,
//       role_id: staff.role_id,
//       role_name: staff.role?.name,
//     };

//     const token = jwt.sign(staffData, process.env.JWT_SECRET, { expiresIn: "1h" });
//     return { token, staff: staffData };
//   } catch (error) {
//     throw new NotFoundError();
//   }
// };

// const getUserFromToken = async (req) => {
//   const staffId = req.staff_id;
//   if (!staffId) throw new AuthenticationError("Token tidak ditemukan.");

//   const user = await findLogin(staffId);
//   if (!user) throw new AuthenticationError("User tidak ditemukan.");

//   return {
//     staff_id: user.staff_id,
//     username: user.username,
//     email: user.email,
//     name: user.name,
//     role_id: user.role_id,
//     role_name: user.role?.name || null,
//     status_deleted: user.status_deleted,
//     created_at: user.created_at,
//     updated_at: user.updated_at,
//   };
// };

// //update password
// const updatePasswordService = async ({ staff_id, newPassword, confirmPassword }) => {
//   if (!staff_id || !newPassword || !confirmPassword) {
//     throw new AuthenticationError("Semua data harus diisi.");
//   }

//   if (newPassword.length < 6) {
//     throw new AuthenticationError("Password minimal 6 karakter.");
//   }

//   if (newPassword !== confirmPassword) {
//     throw new AuthenticationError("Konfirmasi password tidak cocok.");
//   }

//   const staff = await findByIdActive(staff_id);
//   if (!staff) throw new AuthenticationError("User tidak ditemukan atau tidak aktif.");

//   const hashedPassword = await bcrypt.hash(newPassword, 10);
//   staff.password = hashedPassword;
//   staff.updated_at = new Date();
//   await staff.save();

//   return { message: "Password berhasil diperbarui", staff_id: staff.staff_id };
// };

// module.exports = {
//   loginService,
//   getUserFromToken,
//   updatePasswordService,
// };