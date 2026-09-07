const authServ = require("../service/auth.service");
const { successResponse } = require("../../utility/success-respon.utility");
const {verifyCaptcha} = require("../../middleware/captcha.middleware"); // ✅ Tambah ini
const jwt = require("jsonwebtoken");

// 1. Login controller
const login = async (req, res, next) => {
  try {
    const { username, password, captchaToken } = req.body;

    // Validasi input sederhana
    if (!username || !password) {
      return res.status(400).json({
        metaData: {
          message: "Username dan password wajib diisi.",
          code: "VALIDATION_ERROR",
          response_code: "4001",
        },
      });
    }


      if (!captchaToken) {
        return res.status(400).json({
          metaData: {
            message: "Captcha token wajib diisi.",
            code: "CAPTCHA_MISSING",
            response_code: "4002",
          },
        });
      }

      // Validasi Cloudflare Turnstile/Captcha
      const captchaValid = await verifyCaptcha(captchaToken);
      if (!captchaValid) {
        return res.status(400).json({
          metaData: {
            message: "Captcha validation failed",
            code: "CAPTCHA_INVALID",
            response_code: "4003",
          },
        });
      }
    // }

    const data = await authServ.loginService(username, password);

    // Set cookie auth_token
    res.cookie('auth_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // hanya secure di production
      sameSite: process.env.NODE_ENV === 'production' ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 jam
    });

    // Set header Authorization
    res.setHeader("Authorization", `Bearer ${data.token}`);
    res.setHeader("Access-Control-Expose-Headers", "Authorization");

    return successResponse(
      res,
      {
        staff: data.staff,
        token: data.token,
      },
      {
        message: "Login berhasil",
        code: "200",
        response_code: "0000",
      }
    );
    
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// 2. logout api
const logout = (req, res, next) => {
  try {
    // Hapus token yang disimpan di header
    res.setHeader("Authorization", "");
    res.setHeader("Access-Control-Expose-Headers", "Authorization");

    // Jika menggunakan penyimpanan token di cookies, bisa menggunakan:
    res.clearCookie('token'); // jika menggunakan cookie untuk menyimpan token
    res.clearCookie('auth_token'); // jika menggunakan cookie untuk menyimpan token

    return successResponse(
      res,
      {},
      {
        message: "Logout berhasil",
        code: "200",
        response_code: "0000",
      }
    );
  } catch (error) {
    next(error);
  }
};

// 3. get detail user login
const getUserProfile = async (req, res, next) => {
  try {
    const data = await authServ.getUserFromToken(req);
    
    return successResponse(res, data, {
      message: "Berhasil menampilkan data",
      code: 200,
      response_code: "0000",
    });
  } catch (error) {
    next(error); // Pastikan error yang dilemparkan diteruskan ke error handler
  }
};

// 3. get detail user login
const sendotp = async (req, res, next) => {
  try {

    const email = req.body.email
    const data = await authServ.sendOtpToEmailService(email);
    

    return successResponse(res, data, {
      message: "Berhasil kirim otp",
      code: 200,
      response_code: "0000",
    });
  } catch (error) {
    next(error); // Pastikan error yang dilemparkan diteruskan ke error handler
  }
};

// 3. get detail user login
const verifyotp = async (req, res, next) => {
  try {
    const otpInput = req.body.otpInput;
    const email = req.body.email;

    // Panggil service verifikasi OTP
    const data = await authServ.verifyOtpService(email, otpInput);

    res.cookie('auth_token', data.token, {
      httpOnly: true,
       secure: true,
      sameSite: "None",
    });

    // Opsional: Kirim token di header Authorization juga (jika masih dibutuhkan)
    res.setHeader("Authorization", `Bearer ${data.token}`);

    // Agar header Authorization bisa diakses oleh browser frontend
    res.setHeader("Access-Control-Expose-Headers", "Authorization");


    return successResponse(res, data, {
      message: "OTP berhasil diverifikasi",
      code: 200,
      response_code: "0000",
    });
  } catch (error) {
    next(error);
  }
};

// updte password reset
const updatePassword = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const   staff_id  = req.staff_id;

    const result = await authServ.updatePasswordService({
      staff_id,
      newPassword,
      confirmPassword,
    });

    return successResponse(res, result, {
      message: "Password berhasil diperbarui",
      code: 200,
      response_code: "0000",
    });
  } catch (error) {
    next(error);
  }
};

// send otp update password
const sendOTPupdatePW = async (req, res, next) => {
  try {

    const email = req.email
    const oldPassword = req.body.oldPassword
    const data = await authServ.sendOtpWithPasswordVerification(email, oldPassword);
    

    return successResponse(res, data, {
      message: "Berhasil kirim otp",
      code: 200,
      response_code: "0000",
    });
  } catch (error) {
    next(error); // Pastikan error yang dilemparkan diteruskan ke error handler
  }
};

// updte password update
const updatePasswordUpdate = async (req, res, next) => {
  try {
    const { otpCode, newPassword, confirmPassword } = req.body;
    const staff_id = req.staff_id

    const result = await authServ.verifyOtpAndUpdatePasswordService(
      staff_id,
      otpCode,
      newPassword,
      confirmPassword,
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

module.exports = {
  login,
  logout,
  sendotp,
  verifyotp,
  getUserProfile,
  updatePassword,
  sendOTPupdatePW,
  updatePasswordUpdate,
};
