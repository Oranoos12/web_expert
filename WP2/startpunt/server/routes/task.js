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

// (a) admin: alle taken
router.get("/all",
    cookieParser(),
    authenticate,
    authorize('admin'),
    taskController.getAllTasks
);

// (c) admin: taak toekennen aan een gebruiker
router.patch("/:taskId/user",
    cookieParser(),
    bodyParser.json(),
    function (req, res, next) {
        req.body = req.body || {};
        next();
    },
    authenticate,
    authorize('admin'),
    taskController.assignTask
);

module.exports = router;
