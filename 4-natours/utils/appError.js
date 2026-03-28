class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = Number(statusCode);
    this.status = `${String(statusCode).startsWith('4')}` ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.contructor);
  }
}

module.exports = AppError;
