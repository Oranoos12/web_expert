const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require('bcryptjs');

const usersIncludingPasswords = [
    {
        _id: new ObjectId("61a76d61394acba6dbfa0d80"),
        username: "user1",
        roles: ["user"],
        password: "password1",
        hashedPassword: bcrypt.hashSync("password1", 8)
    },
    {
        _id: new ObjectId("61a76d61394acba6dbfa0d81"),
        username: "user2",
        roles: ["user"],
        password: "password2",
        hashedPassword: bcrypt.hashSync("password2", 8)
    }
];

const tasks = [
    {
        _id: new ObjectId("61a9079ed842a2429ae53d82"),
        todo: 'task1',
        completed: false,
        userId: usersIncludingPasswords[0]._id
    },
    {
        _id: new ObjectId("61a9079ed842a2429ae53d83"),
        todo: 'task2',
        completed: false,
        userId: usersIncludingPasswords[0]._id
    },
    {
        _id: new ObjectId("61a9079ed842a2429ae53d84"),
        todo: 'task3',
        completed: false,
    }
];


module.exports = {usersIncludingPasswords, tasks};
