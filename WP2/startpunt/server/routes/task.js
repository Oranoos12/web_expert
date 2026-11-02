const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const taskController = require("../controllers/taskController");
const {authenticate, authorize} = require("../middleware/authentication");

router.get("/",
    cookieParser(),
    authenticate,
    authorize('user'),
    taskController.getTasksOfUser
);

router.patch("/:taskId",
    cookieParser(),
    bodyParser.json(),
    (req, res, next) => {
        req.body = req.body || {};
        next();
    },
    authenticate,
    authorize('user'),
    taskController.updateTaskCompletion
);
module.exports = router;
