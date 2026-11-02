const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const invalidIds = [
    [''], ['12'],
    ['61a9079ed842a2429ae53d8'],
    ['429ae53d844', 12, null]
];



const usersIncludingPasswords = [
    {
        username: "user1",
        roles: ["user"],
        password: "password1"
    },
    {
        username: "user2",
        roles: ["admin"],
        password: "password2"
    }
];


module.exports = {invalidIds, usersIncludingPasswords};
