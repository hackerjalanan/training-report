// config/db.config.js
module.exports = {
  mysql: {
    HOST: process.env.MYSQL_HOST,
    PORT: process.env.MYSQL_PORT,
    USERNAME: process.env.MYSQL_USER,
    PASSWORD: process.env.MYSQL_PASS,
    DB: process.env.MYSQL_DB,
    DIALECT: "mysql",
    dialectModule: require('mysql2'),
    OPTIONS: {
      connectTimeout: 5000, // Timeout 5 detik (sesuai Vercel Hobby 10s limit)
      pool: {
        max: 10,
        min: 0,
        acquire: 5000, // Turunkan dari 30000 agar tidak melebihi timeout
        idle: 10000,
      },
    },
    LOGGING: process.env.NODE_ENV === "development" ? console.log : false,
  },
};