const { Sequelize, DataTypes, Op, QueryTypes } = require("sequelize");
const dbConfig = require("../config/db.config")["mysql"];
const fs = require("fs");
const path = require("path");

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USERNAME, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.DIALECT,
  pool: dbConfig.OPTIONS,
  logging: (msg) => !msg.includes("SELECT 1+1 AS result") && console.log(msg),
});

// Attempt database connection with retries
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log("Connected to MySQL!");
      return;
    } catch (err) {
      console.error(`Attempt ${i + 1}: Retrying in ${delay / 1000}s...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  console.error("Failed to connect after multiple attempts.");
  throw new Error("Database connection failed");

};
connectWithRetry();

// Load models dynamically
const db = { sequelize, Sequelize, Op, QueryTypes };
const modelsFolder = path.join(__dirname, "../src/model");
fs.readdirSync(modelsFolder)
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(modelsFolder, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Initialize associations
Object.values(db).forEach((model) => model.associate?.(db));

module.exports = db;
