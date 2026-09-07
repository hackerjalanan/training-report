// config/email.config.js

module.exports = {
  gmail: {
    email: process.env.OTP_SENDER_EMAIL,
    password: process.env.OTP_SENDER_PASSWORD_EMAIL,
    tokenExpirySeconds: parseInt(process.env.OTP_TOKEN_EXPIRED_TIME_SECOND, 10),
  },
};
