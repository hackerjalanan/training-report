class ModelDuplicateDataError extends Error {
  constructor(message, data = {}) {
    super();
    this.message = message ? message : "Duplikat data";
    this.data = data;
  }
}

module.exports = {
  ModelDuplicateDataError,
};
