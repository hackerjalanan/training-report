const { NotFoundError } = require("./not-found.error");
const { DataAlreadyExistError } = require("./data-already-exist.error");
const { InvalidParameterError } = require("./invalid-parameter.error");
const { CodeError } = require("./code.error");
const { ModelNotFoundError } = require("./model-not-found.error");
const { ModelDuplicateDataError } = require("./model-duplicate-data.error");
const { QueryError } = require("./query.error");
const { AuthenticationError } = require("./authentication.error");
const { LimitError } = require("./limit.error");
const { PreviousStageNotPassedError } = require("./previous-stage-not-passed.error");
const { SyncronizationError } = require("./syncronization.error");

const urlValidation = (req, res, next) => {
  throw new NotFoundError("Url Not Found");
};

const handleErrors = (err, req, res, next) => {
  if (err instanceof ModelNotFoundError) {
    return res.status(200).json({
      response: {},
      metaData: {
        message: `Ops, ${err.message ? err.message : "Data tidak ditemukana."}`,
        code: 200,
        response_code: "5574",
      },
    });
  }

  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      response: {},
      metaData: {
        message: `${err.message ? err.message : "Not authenticated, wrong username or password."}`,
        code: 401,
        response_code: "0001",
      },
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      response: {},
      metaData: {
        message: `${err.message ? err.message : "Data not found."}`,
        code: 404,
        response_code: "0001",
      },
    });
  }

  if (err instanceof DataAlreadyExistError) {
    return res.status(422).json({
      response: {},
      metaData: {
        message: `${err.message ? err.message : "Data has been used."}`,
        code: 422,
        response_code: "0001",
      },
    });
  }

  if (err instanceof InvalidParameterError) {
    return res.status(422).json({
      response: {
        data: err.data,
      },
      metaData: {
        message: err.message,
        code: 422,
        response_code: "5505",
      },
    });
  }

  if (err instanceof ModelDuplicateDataError) {
    return res.status(422).json({
      response: err.data,
      metaData: {
        message: "Ops, " + err.message,
        code: 422,
        response_code: "5542",
      },
    });
  }

  if (err instanceof CodeError) {
    return res.status(500).json({
      response: err.data,
      metaData: {
        message: `${err.message ? err.message : "Internal server error."}`,
        code: 500,
        response_code: "0001",
      },
    });
  }

  if (err instanceof QueryError) {
    return res.status(err.data.metaData.code).json({
      response: err.data.data,
      metaData: {
        message: "Ops, terjadi kesalahan query. " + err.data.metaData.message,
        code: err.data.metaData.code,
        response_code: err.data.metaData.response_code,
      },
    });
  }

  if (err instanceof LimitError) {
    return res.status(422).json({
      response: {},
      metaData: {
        message: `${err.message ? err.message : "Out of limit!"}`,
        code: 422,
        response_code: "0001",
      },
    });
  }

  if (err instanceof PreviousStageNotPassedError) {
    return res.status(422).json({
      response: {},
      metaData: {
        message: err.message,
        code: 422,
        response_code: "0001",
      },
    });
  }

  if (err instanceof SyncronizationError) {
    return res.status(422).json({
      response: {},
      metaData: {
        message: err.message,
        code: 422,
        response_code: "0001",
      },
    });
  }

  console.error(err);
  return res.status(500).json({
    response: {},
    metaData: {
      message: "Ops, " + err.message,
      code: 500,
      response_code: "0001",
    },
  });
};

module.exports = {
  urlValidation,
  handleErrors,
};
