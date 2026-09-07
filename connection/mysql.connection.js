// mysql.connect.js
const { Sequelize, DataTypes, Op, QueryTypes } = require("sequelize");
const dbConfig = require("../config/db.config")["postgres"];
const fs = require("fs");
const path = require("path");

// Initialize Sequelize (Singleton Pattern - WAJIB untuk Vercel Serverless)
if (!global.sequelizeInstance) {
  global.sequelizeInstance = new Sequelize(
  dbConfig.DB,
  dbConfig.USERNAME,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.DIALECT,
    dialectModule: dbConfig.dialectModule,

    dialectOptions: {
      ssl: dbConfig.OPTIONS.ssl,
      connectTimeout: dbConfig.OPTIONS.connectTimeout,
    },

    pool: dbConfig.OPTIONS.pool,
    logging: dbConfig.LOGGING,

    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ESOCKETTIMEDOUT/,
        /EPIPE/,
        /EAI_AGAIN/,
        /ENETUNREACH/, 
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
      max: 3,
    },
  }
);

  // Cleanup pool saat aplikasi dimatikan
  const shutdown = async () => {
    try {
      await global.sequelizeInstance.close();
      console.log('PostgreSQL connection pool closed.');
    } catch (err) {
      console.error('Error closing PostgreSQL pool:', err);
    }
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown); 
}

const sequelize = global.sequelizeInstance;

// Load models dynamically
const db = { sequelize, Sequelize, Op, QueryTypes };
const modelsFolder = path.join(__dirname, "../src/model");
if (fs.existsSync(modelsFolder)) { 
  fs.readdirSync(modelsFolder)
    .filter((file) => file.endsWith(".js"))
    .forEach((file) => {
      const model = require(path.join(modelsFolder, file))(sequelize, DataTypes);
      db[model.name] = model;
    });
} else {
  console.error(`❌ Models folder tidak ditemukan: ${modelsFolder}`);
}

// Initialize associations
Object.values(db).forEach((model) => model.associate?.(db));

module.exports = db;