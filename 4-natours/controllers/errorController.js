const AppError = require('../utils/appError');

const handleCastErrorDB = err =>
  new AppError(`Invalid ${err.path} is ${err.value}`, 400);

const handleDuplicateFieldsDB = err =>
  new AppError(
    `Duplicate field value: ${err.keyValue.name}. Please use another value`,
    400,
  );

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  } else {
    console.log(process.env.NODE_ENV);
  }
};
