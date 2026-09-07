class ModelNotFoundError extends Error {
  constructor(message) {
    super();
    this.message = message;
  }
}

module.exports = {
  ModelNotFoundError,
};
