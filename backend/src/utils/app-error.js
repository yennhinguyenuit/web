class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

const createError = (message, statusCode = 500, details = null) => {
  return new AppError(message, statusCode, details);
};

const isAppError = (error) => error instanceof AppError;

module.exports = {
  AppError,
  createError,
  isAppError,
};
