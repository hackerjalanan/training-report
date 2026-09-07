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
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    LOGGING: process.env.NODE_ENV === "development" ? console.log : false,
  },
};