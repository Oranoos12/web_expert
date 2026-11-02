const bcrypt = require('bcryptjs');

const usersIncludingPasswords = [
    {
        _id: "11111111-1111-4111-8111-111111111111",
        username: "user1",
        roles: ["user"],
        password: "password1",
        hashedPassword: bcrypt.hashSync("password1", 8)
    },
    {
        _id: "22222222-2222-4222-8222-222222222222",
        username: "user2",
        roles: ["user"],
        password: "password2",
        hashedPassword: bcrypt.hashSync("password2", 8)
    }
];

// administrator, voor de admin-routes
const admin = {
    _id: "33333333-3333-4333-8333-333333333333",
    username: "admin1",
    roles: ["admin"],
    password: "password3",
    hashedPassword: bcrypt.hashSync("password3", 8)
};

const tasks = [
    {
        _id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
        todo: 'task1',
        completed: false,
        userId: usersIncludingPasswords[0]._id
    },
    {
        _id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
        todo: 'task2',
        completed: false,
        userId: usersIncludingPasswords[0]._id
    },
    {
        _id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
        todo: 'task3',
        completed: false,
    }
];


module.exports = {usersIncludingPasswords, admin, tasks};
