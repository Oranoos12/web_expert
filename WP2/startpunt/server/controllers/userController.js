const userService = require("../services/userService");

// (b) GET /user
module.exports.getAllUsers = async function (req, res, next) {
    try {
        const users = await userService.findAll();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};
