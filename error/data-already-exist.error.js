class DataAlreadyExistError extends Error {
  constructor(message) {
    super();
    this.message = message;
  }
}

module.exports = {
  DataAlreadyExistError,
};
