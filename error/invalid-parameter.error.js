class InvalidParameterError extends Error {
  constructor(message, data = null) {
    super();
    this.message = message ? message : "Invalid parameter!";
    this.data = data;
  }
}

module.exports = {
  InvalidParameterError,
};
