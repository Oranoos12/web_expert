const jwt = require('jsonwebtoken');
const {AuthenticationError, AuthorisationError} = require('../errors/error');

const JWT_SECRET = process.env.JWT_SECRET;

const includesAny = (array, values) => values.some(v => array.includes(v));

exports.authenticate = async (req, res, next) => {
    try {
        const {token} = req.cookies;
        if (!token) {
            return next(new AuthenticationError('A token is required for authentication'));
        }
        req.requestingUser = await jwt.verify(token, JWT_SECRET, {algorithm: 'HS256'});
        next();
    } catch (err) {
        return next(new AuthenticationError('Invalid authentication token'));
    }
};

exports.authorize = (...roles) => {
    return async (req, res, next) => {
        try {
            const {requestingUser} = req;
            if (!requestingUser || !requestingUser.roles) {
                return next(new AuthenticationError('No user roles found'));
            }
            const authorized = includesAny(requestingUser.roles, roles);
            if (!authorized) {
                return next(new AuthorisationError('Insufficient permissions'));
            }
            next();
        } catch (err) {
            return next(new AuthenticationError('Invalid user data'));
        }
    };
};
