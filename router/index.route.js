const fs = require("fs");
const path = require("path");
const express = require("express");

const router = express.Router();

// Utility
const { successResponse } = require("../utility/success-respon.utility");
const db = require("../connection/mysql.connection"); // Database connection

// Dynamically load all route files in the directory
const routeFiles = fs
  .readdirSync(__dirname)
  .filter((file) => file !== "index.route.js" && file.endsWith(".route.js"));

// Import and use all route files
routeFiles.forEach((file) => {
  const route = require(path.join(__dirname, file));
  router.use("/", route);
});

// 1. Route for checking server and database connection status
router.get("/", async (req, res) => {
  try {
    // Test the connection to the database
    await db.sequelize.authenticate();
    // If successful, send a success response
    return successResponse(
      res,
      "Server is available and database is connected.",
    );
  } catch (err) {
    // Log error for debugging
    console.error("Database connection error:", err);

    // Send an error response if database connection fails
    return res.status(500).json({
      message: "Database connection error",
      error: err.message || "Unknown error",
      code: "500",
      response_code: "0002",
    });
  }
});

module.exports = router;
