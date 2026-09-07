const crypto = require("crypto");
const bcrypt = require("bcrypt");
// const configKey = require('../config/aes.config.js');

class EncryptDecryptClass {
  // Function to hash OTP with a fixed length
  generateHashedOtp(otp) {
    const hash = crypto
      .createHash("sha256") // Use a secure hashing algorithm
      .update(otp)
      .digest("hex"); // Generate the hash in hexadecimal format

    return hash.slice(0, 10); // Truncate to 10 characters
  }
}
// asa
module.exports = EncryptDecryptClass;
  