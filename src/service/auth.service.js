// auth.service.js
const { v7: uuidv7 } = require("uuid");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");

const { findByEmailActive, sendOtpToEmail } = require("../repository/auth.repository");
const errorFormat = require("../../utility/error-format");
const emailConfig = require("../../config/email.config");
const tokenConfig = require("../../config/token.config"); // gunakan JWT secret dari sini
// import libery
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//  import funtion
const { findLogin } = require("../repository/auth.repository");
const { AuthenticationError } = require("../../error/authentication.error");
const { NotFoundError } = require("../../error/not-found.error");

const db = require("../../connection/mysql.connection");
const otp_verify = db.otp_verify;
const staff = db.staff;


// 1. login
const loginService = async (username, passwordInput) => {
  try {
    
    if (!username || !passwordInput) {
      throw new AuthenticationError("Username atau password tidak boleh kosong.");
    }

    const staff = await findLogin(username);
    if (!staff) throw new AuthenticationError("Akun tidak ditemukan.");

    // Gunakan bcrypt langsung
    const passwordMatch = await bcrypt.compare(passwordInput, staff.password);
    if (!passwordMatch) throw new AuthenticationError("Password salah.");

    const staffData = {
      staff_id: staff.staff_id,
      username: staff.username,
      email: staff.email,
      name: staff.name,
      role_id: staff.role_id,
      role_name: staff.role?.name ,
    };

    // Buat token JWT
    const token = jwt.sign(
      staffData,
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { token, staff: staffData };
  } catch (error) {
    console.error(error);
    throw new NotFoundError();
  }
};

// 2. get staff login
const getUserFromToken = async (req) => {
  const staffId = req.staff_id;

  try {
    if (!staffId) {
      throw new AuthenticationError("Token tidak ditemukan.");
    }

    // Ambil data user dari DB lengkap dengan relasi role
    const user = await findLogin(staffId);
    if (!user) {
      throw new AuthenticationError("User tidak ditemukan.");
    }

    return {
      staff_id: user.staff_id,
      username: user.username,
      email: user.email,
      name: user.name,
      role_id: user.role_id,
      role_name: user.role?.name || null,
      status_deleted: user.status_deleted,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  } catch (error) {
    throw new AuthenticationError("Token expired or invalid.");
  }
};


const sendOtpToEmailService = async (email) => {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AuthenticationError("Format email tidak valid.");
    }

    const staff = await findByEmailActive(email);
    if (!staff) {
      throw new AuthenticationError("Email tidak terdaftar atau belum aktif.");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, 10);

    const tokenId = uuidv7();
    const now = new Date();
    const expiry = new Date(now.getTime() + emailConfig.gmail.tokenExpirySeconds * 1000);

    await otp_verify.create({
      id_otp: tokenId,
      staff_id: staff.staff_id,
      otp: hashedOtp,
      status: 0,
      created_at: now,
      updated_at: now,
      expired_at: expiry,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailConfig.gmail.email,
        pass: emailConfig.gmail.password,
      },
    });

    const mailOptions = {
      from: `"OTP Verification" <${emailConfig.gmail.email}>`,
      to: staff.email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otpCode}. It will expire in ${emailConfig.gmail.tokenExpirySeconds / 60} minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return {
      message: "OTP berhasil dikirim",
      email,
      expired_at: expiry.toISOString(),
      staff_id: staff.staff_id,
    };
  } catch (error) {
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeDatabaseError"
    ) {
      const errObj = await errorFormat.sequelizeDB(error);
      throw new AuthenticationError(errObj.metaData.message || "Gagal mengirim OTP", errObj);
    }
    throw new AuthenticationError(error.message || "Terjadi kesalahan saat mengirim OTP");
  }
};

const verifyOtpService = async (email, otpCode) => {
  try {
    const now = new Date();

    const staff = await findByEmailActive(email);
    if (!staff) {
      throw new AuthenticationError("Email tidak terdaftar atau belum aktif.");
    }

    const staffData = {
      staff_id: staff.staff_id,
      username: staff.username,
      email: staff.email,
      name: staff.name,
      role_id: staff.role_id,
      role_name: staff.role?.name ,
    };

    const otpRecord = await otp_verify.findOne({
      where: {
        staff_id: staff.staff_id,
        status: 0
      },
      order: [['created_at', 'DESC']],
    });

    if (!otpRecord) {
      throw new AuthenticationError("OTP tidak ditemukan atau sudah kadaluarsa.");
    }

    const isMatch = await bcrypt.compare(otpCode, otpRecord.otp);
    if (!isMatch) {
      throw new AuthenticationError("Kode OTP salah.");
    }

    otpRecord.status = 1;
    otpRecord.updated_at = now;
    await otpRecord.save();

     // Buat token JWT
    const token = jwt.sign(
      staffData,
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      message: "OTP berhasil diverifikasi",
      email,
      staff_id: staff.staff_id,
      token,
    };
  } catch (error) {
    throw new AuthenticationError(error.message || "Verifikasi OTP gagal");
  }
};


const updatePasswordService = async ({ staff_id, newPassword, confirmPassword }) => {
  try {
    if (!staff_id || !newPassword || !confirmPassword) {
      throw new AuthenticationError("Semua data harus diisi.");
    }

    if (newPassword.length < 6) {
      throw new AuthenticationError("Password minimal 6 karakter.");
    }

    if (newPassword !== confirmPassword) {
      throw new AuthenticationError("Konfirmasi password tidak cocok.");
    }

    // Cari staff aktif berdasarkan staff_id
    const staff = await findByIdActive(staff_id);
    if (!staff) {
      throw new AuthenticationError("User tidak ditemukan atau tidak aktif.");
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password dan timestamp
    staff.password = hashedPassword;
    staff.updated_at = new Date();
    await staff.save();

    return {
      message: "Password berhasil diperbarui",
      staff_id: staff.staff_id,
    };
  } catch (error) {
    throw new AuthenticationError(error.message || "Gagal memperbarui password");
  }
};

const findByIdActive = async (staff_id) => {
  return await staff.findOne({
    where: {
      staff_id,
      status_deleted: 1,
    },
  });
};

// update password
const sendOtpWithPasswordVerification = async (email, oldPassword) => {
  try {
    // Validasi input email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AuthenticationError("Format email tidak valid.");
    }

    // Validasi input password
    if (!oldPassword) {
      throw new AuthenticationError("Password lama harus diisi.");
    }

    // Cari staff berdasarkan email
    const staff = await findByEmailActive(email);
    if (!staff) {
      throw new AuthenticationError("Email tidak terdaftar atau belum aktif.");
    }

    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(oldPassword, staff.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Password lama tidak sesuai.");
    }

    // Generate OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, 10);

    // Generate token ID dan waktu
    const tokenId = uuidv7();
    const now = new Date();
    const expiry = new Date(now.getTime() + emailConfig.gmail.tokenExpirySeconds * 1000);

    // Simpan OTP ke database
    await otp_verify.create({
      id_otp: tokenId,
      staff_id: staff.staff_id,
      otp: hashedOtp,
      status: 0,
      created_at: now,
      updated_at: now,
      expired_at: expiry,
    });

    // Konfigurasi email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailConfig.gmail.email,
        pass: emailConfig.gmail.password,
      },
    });

    // Konfigurasi email
    const mailOptions = {
      from: `"OTP Verification" <${emailConfig.gmail.email}>`,
      to: staff.email,
      subject: "Your OTP Code for Password Change",
      text: `Your OTP code for password change is: ${otpCode}. It will expire in ${emailConfig.gmail.tokenExpirySeconds / 60} minutes.`,
    };

    // Kirim email
    await transporter.sendMail(mailOptions);

    return {
      message: "Password lama terverifikasi. OTP berhasil dikirim",
      email,
      expired_at: expiry.toISOString(),
      staff_id: staff.staff_id,
    };
  } catch (error) {
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeDatabaseError"
    ) {
      const errObj = await errorFormat.sequelizeDB(error);
      throw new AuthenticationError(errObj.metaData.message || "Gagal mengirim OTP", errObj);
    }
    throw new AuthenticationError(error.message || "Terjadi kesalahan saat mengirim OTP");
  }
};

// Controller - updatePasswordUpdate
const updatePasswordUpdate = async (req, res, next) => {
  try {
    const { otpCode, newPassword, confirmPassword } = req.body;
    const staff_id = req.staff_id;

    // Panggil service dengan parameter yang benar (bukan object)
    const result = await authServ.verifyOtpAndUpdatePasswordService(
      staff_id,
      otpCode,
      newPassword,
      confirmPassword
    );

    return successResponse(res, result, {
      message: "Password berhasil diperbarui",
      code: 200,
      response_code: "0000",
    });
  } catch (error) {
    next(error);
  }
};

// Service - verifyOtpAndUpdatePasswordService (Fixed)
const verifyOtpAndUpdatePasswordService = async (staff_id, otpCode, newPassword, confirmPassword) => {
  try {
    const now = new Date();

    // Validasi input
    const missingFields = [];
    if (!staff_id) missingFields.push("Staff ID");
    if (!otpCode) missingFields.push("Kode OTP");
    if (!newPassword) missingFields.push("Password baru");
    if (!confirmPassword) missingFields.push("Konfirmasi password");

    if (missingFields.length > 0) {
      throw new AuthenticationError(`Data berikut harus diisi: ${missingFields.join(", ")}.`);
    }

    if (newPassword.length < 6) {
      throw new AuthenticationError("Password minimal 6 karakter.");
    }

    if (newPassword !== confirmPassword) {
      throw new AuthenticationError("Konfirmasi password tidak cocok.");
    }

    // Cari staff terlebih dahulu untuk memastikan staff ada
    const staff = await findByIdActive(staff_id);
    if (!staff) {
      throw new AuthenticationError("Staff tidak ditemukan atau tidak aktif.");
    }

    // Cari OTP record yang masih aktif
    const otpRecord = await otp_verify.findOne({
      where: {
        staff_id: staff_id,
        status: 0
      },
      order: [['created_at', 'DESC']],
    });

    if (!otpRecord) {
      throw new AuthenticationError("OTP tidak ditemukan atau sudah digunakan.");
    }

    // Cek apakah OTP sudah expired
    if (now > otpRecord.expired_at) {
      // Update status OTP menjadi expired
      otpRecord.status = 2; // 2 = expired
      otpRecord.updated_at = now;
      await otpRecord.save();
      
      throw new AuthenticationError("OTP sudah kadaluarsa.");
    }

    // Verifikasi OTP code
    const isOtpMatch = await bcrypt.compare(otpCode, otpRecord.otp);
    if (!isOtpMatch) {
      throw new AuthenticationError("Kode OTP salah.");
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password staff
    staff.password = hashedPassword;
    staff.updated_at = now;
    await staff.save();

    // Update status OTP menjadi used (1)
    otpRecord.status = 1;
    otpRecord.updated_at = now;
    await otpRecord.save();

    return {
      message: "OTP berhasil diverifikasi dan password berhasil diperbarui",
      email: staff.email,
      staff_id: staff.staff_id,
    };
  } catch (error) {
    // Log error untuk debugging
    console.error("Error in verifyOtpAndUpdatePasswordService:", error);
    
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeDatabaseError"
    ) {
      const errObj = await errorFormat.sequelizeDB(error);
      throw new AuthenticationError(errObj.metaData.message || "Gagal memperbarui password", errObj);
    }
    
    // Pastikan error message muncul
    if (error instanceof AuthenticationError) {
      throw error; // Re-throw AuthenticationError as is
    }
    
    throw new AuthenticationError(error.message || "Terjadi kesalahan saat memperbarui password");
  }
};

module.exports = {
  loginService,
  verifyOtpService,
  getUserFromToken,
  updatePasswordService,
  sendOtpToEmailService,
  sendOtpWithPasswordVerification,
  verifyOtpAndUpdatePasswordService,
};
