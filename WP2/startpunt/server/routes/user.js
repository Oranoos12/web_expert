const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const userController = require("../controllers/userController");
const {authenticate, authorize} = require("../middleware/authentication");

// (b) admin: alle gebruikers
router.get("/",
    cookieParser(),
    authenticate,
    authorize('admin'),
    userController.getAllUsers
);

module.exports = router;
