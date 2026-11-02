const invalidIds = [
    [''], ['12'],
    ['61a9079ed842a2429ae53d8'],
    ['61a9079ed842a2429ae53d82'], // een ObjectId is geen uuid
    ['11111111-1111-4111-8111-11111111111'], // 1 teken te kort
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
