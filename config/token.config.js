// config/token.config.js
module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: parseInt(process.env.AUTH_TOKEN_EXPIRED_TIME_MINUTE, 10) * 60, // dalam detik
  },
};
