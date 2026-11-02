const User = require("../models/userModel.js");

// (b) admin: alle gebruikers ophalen
// enkel _id, username en roles, het wachtwoord (hashedPassword) sturen we nooit terug
async function findAll() {
    return User.find({}, '_id username roles');
}

module.exports = {findAll};
