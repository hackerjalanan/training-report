class DatabaseConnectionError extends Error {
  constructor(message) {
    super(message);
    this.name = "DatabaseConnectionError";
    this.status = 500; // HTTP status code for server error
  }
}

module.exports = { DatabaseConnectionError };
