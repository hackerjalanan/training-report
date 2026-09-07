const cron = require('node-cron');
const { Op } = require('sequelize');

// Import koneksi dan model
const db = require('../connection/mysql.connection');
const training_sesi = db.training_sesi;
const otp_verify = db.otp_verify;

// CRON: setiap menit
cron.schedule('* * * * *', async () => {
  const now = new Date();

  try {
    // ========== Update Training Status ==========
    // Belum dimulai → "no active"
    await training_sesi.update(
      { status_active: 'no active' },
      { where: { start_date: { [Op.gt]: now } } }
    );

    // Sedang berlangsung → "active"
    await training_sesi.update(
      { status_active: 'active' },
      {
        where: {
          start_date: { [Op.lte]: now },
          end_date: { [Op.gte]: now }
        }
      }
    );

    // Sudah selesai → "finish"
    await training_sesi.update(
      { status_active: 'finish' },
      { where: { end_date: { [Op.lt]: now } } }
    );

    // ========== Update OTP Status ==========
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const updatedOtpCount = await otp_verify.update(
      { status: 1 },
      {
        where: {
          status: 0,
          created_at: { [Op.lt]: fiveMinutesAgo }
        }
      }
    );

    console.log(`[CRON] Training statuses and expired OTPs updated at ${now}`);
  } catch (error) {
    console.error(`[CRON ERROR] ${error.message}`);
  }
});
