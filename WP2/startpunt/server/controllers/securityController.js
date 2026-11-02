const ms = require('ms');
const jwt = require('jsonwebtoken');
const {ValidationError, AuthenticationError} = require('../errors/error');
const securityService = require('../services/securityService');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;

module.exports.login = async function (req, res, next) {
    try {
        const {username, password} = req.body;
        const user = await securityService.findByCredentials(username, password);
        const token = jwt.sign(
            {_id: user._id, username: user.username, roles: user.roles},
            JWT_SECRET,
            {expiresIn: JWT_EXPIRATION, algorithm: 'HS256'}
        );
        const expiresInMs = ms(JWT_EXPIRATION);
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            expires: new Date(Date.now() + expiresInMs)
        });
        res.status(200).json({
            _id: user._id,
            username: user.username,
            roles: user.roles
        });
    } catch (err) {
        next(err);
    }
};

module.exports.logout = async function (req, res, next) {
    try {
        res.clearCookie('token');
        res.status(200).json({});
    } catch (err) {
        next(err);
    }
};

module.exports.checkLogin = async function (req, res, next) {
    try {
        res.status(200).json(req.requestingUser);
    } catch (err) {
        next(err);
    }
};
