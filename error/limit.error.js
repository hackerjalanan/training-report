class LimitError extends Error {
  constructor(message) {
    super();
    this.message = message;
  }
}

module.exports = {
  LimitError,
};
