const mongoose = require('mongoose');
const {ValidationError, AuthenticationError} = require('../errors/error');
const User = require('../models/userModel.js');

async function findByCredentials(username, password) {
    if (!username || !password) {
        throw new ValidationError('Username and password are required');
    }
    const user = await User.findOneByCredentials(username, password);
    if (!user) {
        throw new AuthenticationError('Cannot login with these credentials');
    }
    return user;
}

module.exports = {findByCredentials};
