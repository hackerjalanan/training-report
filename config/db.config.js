// config/db.config.js
module.exports = {
  postgres: {
    HOST: process.env.POSTGRES_HOST,
    PORT: Number(process.env.POSTGRES_PORT) || 5432, // cast ke Number, jaga-jaga kalau env var kebaca sebagai string
    USERNAME: process.env.POSTGRES_USER,
    PASSWORD: process.env.POSTGRES_PASSWORD,
    DB: process.env.POSTGRES_DB,
    DIALECT: "postgres",
    dialectModule: require('pg'), // Gunakan pg untuk PostgreSQL
    OPTIONS: {
      connectTimeout: 15000, // dinaikkan dari 5000 -> Supabase (apalagi lewat pooler) sering butuh >5 detik saat cold start, jadi error timeout kalau kekecilan
      pool: {
        max: 10,
        min: 0,
        acquire: 30000, // dinaikkan dari 5000, alasan sama seperti di atas
        idle: 10000,
      },
      // Supabase memerlukan SSL
      ssl: {
        require: true,
        rejectUnauthorized: false, // Nonaktifkan verifikasi sertifikat untuk Supabase
      },
    },
    LOGGING: process.env.NODE_ENV === "development" ? console.log : false,
  },
};