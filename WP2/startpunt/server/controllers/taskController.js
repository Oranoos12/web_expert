const taskService = require("../services/taskService");

module.exports.getTasksOfUser = async function (req, res, next) {
    try {
        const status = 200;
        const {requestingUser} = req;
        const tasks = await taskService.findByUserId(requestingUser._id.toString());
        res.status(status).json(tasks);
    } catch (err) {
        next(err);
    }
};

module.exports.updateTaskCompletion = async function (req, res, next) {
    try {
        const status = 200;
        const {requestingUser} = req;
        const {taskId} = req.params;
        const {completed} = req.body;
        const task = await taskService.updateTask(taskId, requestingUser._id.toString(), {completed});
        res.status(status).json(task);
    } catch (err) {
        next(err);
    }
};

// (a) GET /task/all
module.exports.getAllTasks = async function (req, res, next) {
    try {
        const tasks = await taskService.findAll();
        res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
};

// (c) PATCH /task/:taskId/user   body: { userId }
module.exports.assignTask = async function (req, res, next) {
    try {
        const {taskId} = req.params;
        const {userId} = req.body;
        const task = await taskService.assignTaskToUser(taskId, userId);
        res.status(200).json(task);
    } catch (err) {
        next(err);
    }
};

