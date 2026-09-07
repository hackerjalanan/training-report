// auth.repository.js

// #inport libery
const { Op } = require('sequelize');

// #import funtion
const db = require("../../connection/mysql.connection");
const { QueryError } = require('../../error/query.error');
const errorFormat = require('../../utility/error-format');


//import model
const Staff = db.staff;
const Role = db.role;
const otp_verify = db.otp_verify;


// 1. login 
const findLogin = async (usernameOrEmailOrUserId) => {
  try {
    const config = {
      where: {
        [Op.and]: [
          { status_deleted: "1" }, // hanya user aktif yang bisa login
          {
            [Op.or]: [
              { username: usernameOrEmailOrUserId },
              { email: usernameOrEmailOrUserId },
              { staff_id: usernameOrEmailOrUserId }
            ]
          }
        ]
      },
      include: {
        model: Role,
        as: 'role',
        attributes: ['role_id', 'name', 'alias']
      }
    };

    return await Staff.findOne(config);
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};

const sendOtpToEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new Error("Email tidak boleh kosong");
    }

    const staff = await findByEmailActive(email);
    if (!staff) {
      throw new Error("Email tidak terdaftar atau belum aktif.");
    }

    const otpResult = await sendOtpToEmail(staff);

    // Enkripsi id_otp dalam JWT
    const otpIdToken = jwt.sign(
      { id_otp: otpResult.id_otp },
      tokenConfig.jwt.secret,
      { expiresIn: `${emailConfig.gmail.tokenExpirySeconds}s` }
    );

    // Simpan ke cookie
    res.cookie("otp_token", otpIdToken, {
      httpOnly: true,
      maxAge: emailConfig.gmail.tokenExpirySeconds * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({
      message: otpResult.message,
      expired_at: otpResult.expired_at,
    });
  } catch (error) {
    next(error);
  }
};



const findByEmailActive = async (email) => {
  try {
    return await Staff.findOne({
      where: {
        email,
        status_deleted: "1",
      },
    });
  } catch (error) {
    const errObj = await errorFormat.sequelizeDB(error);
    throw new QueryError(errObj.metaData.message, errObj);
  }
};



module.exports = {
  findLogin,
  sendOtpToEmail,
  findByEmailActive
};
