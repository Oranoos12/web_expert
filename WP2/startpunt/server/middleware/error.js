const {NotFoundError, ValidationError, AuthenticationError, AuthorisationError} = require('../errors/error');

function errorHandler(err, req, res, next) {
    let status = err.status || 500;
    let message = err.message || 'Something went wrong';
    if (err instanceof NotFoundError) {
        status = 404;
    } else if (err instanceof ValidationError) {
        status = 400;
    } else if (err instanceof AuthenticationError) {
        status = 401;
    } else if (err instanceof AuthorisationError) {
        status = 403;
    }
    const response = {error: {message, status}};
    if (process.env.NODE_ENV !== 'production') {
        response.error.stack = err.stack;
    }
    res.status(status).json(response);
}

function routeNotFound(req, res, next) {
    return next(new NotFoundError(`Route not found: ${req.originalUrl}`));
}

module.exports = {errorHandler, routeNotFound};
