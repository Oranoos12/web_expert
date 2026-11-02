const {ValidationError, AuthorisationError, NotFoundError} = require("../errors/error");
const {isValidUuid} = require("../validation/uuid");

const Task = require("../models/taskModel.js");
const User = require("../models/userModel.js");

async function findByUserId(requestingUserId) {
    if (!isValidUuid(requestingUserId)) {
        throw new ValidationError('Id is not valid');
    }
    return Task.find({userId: requestingUserId});
}

async function updateTask(taskId, requestingUserId, {completed, todo, userId}) {
    if (!isValidUuid(taskId)) {
        throw new ValidationError('Id is not valid');
    }
    if (!isValidUuid(requestingUserId)) {
        throw new ValidationError('Id is not valid');
    }

    const task = await Task.findById(taskId);

    if (!task) {
        throw new NotFoundError('Task not found');
    }
    if (!task.userId || requestingUserId !== task.userId) {
        throw new AuthorisationError('User is not the owner of the task');
    }

    if (completed !== undefined) task.completed = completed;
    if (todo !== undefined) task.todo = todo;
    if (userId !== undefined) {
        throw new AuthorisationError("Reassigning userId of a task is not allowed");
    }

    const validationError = task.validateSync();
    if (validationError) {
        throw new ValidationError(`Validation failed: ${validationError.message}`);
    }
    return task.save({validateBeforeSave: false});
}

// (a) admin: alle taken ophalen
async function findAll() {
    return Task.find({});
}

// (c) admin: een taak aan een gebruiker toekennen
async function assignTaskToUser(taskId, userId) {
    if (!isValidUuid(taskId)) {
        throw new ValidationError('Task id is not valid');
    }
    if (!isValidUuid(userId)) {
        throw new ValidationError('User id is not valid');
    }

    const task = await Task.findById(taskId);
    if (!task) {
        throw new NotFoundError('Task not found');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    task.userId = userId;
    return task.save();
}

module.exports = {findByUserId, updateTask, findAll, assignTaskToUser};
