const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const mockingoose = require('mockingoose');
const {randomUUID} = require('crypto');
const Task = require('../../models/taskModel');
const User = require('../../models/userModel');

const taskService = require('../../services/taskService');
const {NotFoundError, ValidationError, AuthorisationError} = require('../../errors/error');
const {invalidIds} = require('./data');


beforeEach(async () => {
    mockingoose.resetAll();
    jest.clearAllMocks();
});

describe('taskService', () => {
    describe('findByUserId', () => {
        test.each(invalidIds)(
            'given invalid id it should throw a ValidationError',
            async (id) => {
                const requestingUser = {
                    _id: randomUUID(),
                    username: 'testuser',
                    roles: ['user']
                }
                await expect(taskService.findByUserId(id, requestingUser))
                    .rejects
                    .toThrow(ValidationError);
            });


        it('returns the tasks if everything is correct',
            async () => {
                const user = new User({username: 'testuser', password: 'password', roles: ['user']});
                const requestingUser = {_id: user._id, username: user.username, roles: user.roles};
                const task = new Task({todo: 'do something', userId: user._id});
                mockingoose(Task).toReturn(task, 'findOne');
                mockingoose(User).toReturn(user, 'findOne');
                jest.spyOn(Task, 'find').mockImplementation(() => Promise.resolve([]));
                const result = await taskService.findByUserId(requestingUser._id.toString(), requestingUser);
                expect(result).toBeInstanceOf(Array);
            });

    })

    describe('updateTask', () => {

        test.each(invalidIds)(
            'given invalid taskId it should throw a ValidationError',
            async (taskId) => {
                const user = new User({username: 'testuser', password: 'password', roles: ['user']});
                const requestingUser = {_id: user._id, username: user.username, roles: user.roles};
                const task = new Task({todo: 'do something', userId: user._id});
                mockingoose(Task).toReturn(task, 'findOne');
                mockingoose(User).toReturn(user, 'findOne');

                await expect(taskService.updateTask(taskId, requestingUser, {completed: true}))
                    .rejects
                    .toThrow(ValidationError);
            });

        it('throws a NotFoundError when the task does not exist', async () => {
            const user = new User({username: 'testuser', password: 'password'});
            const requestingUser = {_id: user._id, username: user.username, roles: user.roles};
            const taskId = randomUUID().toString();
            mockingoose(Task).toReturn(null, 'findOne');
            mockingoose(User).toReturn(user, 'findOne');
            await expect(taskService.updateTask(taskId, requestingUser._id.toString(), {completed: true}))
                .rejects.toThrow(NotFoundError);
        });

        it('throws an AuthorisationError when the task doesn\'t belong to the user', async () => {
            const user = new User({username: 'testuser', password: 'password', roles: ['user']});
            const requestingUser = {_id: user._id, username: user.username, roles: user.roles};
            const task = new Task({todo: 'do something', userId: randomUUID()});
            const taskId = task._id.toString();
            mockingoose(Task).toReturn(task, 'findOne');
            mockingoose(User).toReturn(user, 'findOne');
            await expect(taskService.updateTask(taskId, requestingUser._id.toString(), {completed: true}))
                .rejects.toThrow(AuthorisationError);
        });

        it('throws an AuthorisationError when a regular user tries to reassign the task', async () => {
            const user = new User({username: 'testuser', password: 'password', roles: ['user']});
            const requestingUser = {_id: user._id, username: 'testuser', roles: ['user']};
            const task = new Task({todo: 'do something', userId: randomUUID()});
            const updatedTask = new Task({task: task.todo, userId: task.userId, completed: true});
            const taskId = task._id.toString();
            task.userId = user._id;
            mockingoose(Task).toReturn(task, 'findOne');
            mockingoose(User).toReturn(user, 'findOne');
            await expect(taskService.updateTask(taskId, requestingUser._id.toString(), {userId: randomUUID()}))
                .rejects.toThrow(AuthorisationError);
        });

        it('throws an ValidationError when the new task is invalid', async () => {
            const user = new User({username: 'testuser', password: 'password', roles: ['user']});
            const requestingUser = {_id: user._id, username: 'testuser', roles: ['user']};
            const task = new Task({todo: 'do something', userId: user._id});
            const taskId = task._id.toString();
            jest.spyOn(Task, 'findOne').mockImplementation(() => Promise.resolve(task));
            jest.spyOn(User, 'findOne').mockImplementation(() => Promise.resolve(user));
            jest.spyOn(Task.prototype, 'validateSync').mockImplementation(() => 'oops');
            await expect(taskService.updateTask(taskId, requestingUser._id.toString(), {completed: '...'}))
                .rejects.toThrow(ValidationError);
        });

        it('saves the value of completed when everything is correct',
            async () => {
                const user = new User({username: 'testuser', password: 'password', roles: ['user']});
                const requestingUser = {_id: user._id, username: 'testuser', roles: ['user']};
                const task = new Task({todo: 'do something', userId: randomUUID()});
                const updatedTask = new Task({task: task.todo, userId: task.userId, completed: true});
                const taskId = task._id.toString();
                task.userId = user._id;
                jest.spyOn(Task, 'findOne').mockImplementation(() => Promise.resolve(task));
                jest.spyOn(User, 'findOne').mockImplementation(() => Promise.resolve(user));
                jest.spyOn(Task.prototype, 'validateSync').mockImplementation(() => null);
                jest.spyOn(Task.prototype, 'save').mockImplementation(() => Promise.resolve(updatedTask));
                const result = await taskService.updateTask(taskId, requestingUser._id.toString(), {
                    completed: updatedTask.completed
                });
                expect(result).toBeInstanceOf(Task);
                expect(result.completed).toBe(updatedTask.completed);
            });

        it('saves the value of todo when everything is correct',
            async () => {
                const user = new User({username: 'testuser', password: 'password', roles: ['user']});
                const requestingUser = {_id: user._id, username: 'testuser', roles: ['user']};
                const task = new Task({todo: 'do something', userId: randomUUID()});
                const updatedTask = new Task({todo: 'do something else', userId: task.userId});
                const taskId = task._id.toString();
                task.userId = user._id;
                jest.spyOn(Task, 'findOne').mockImplementation(() => Promise.resolve(task));
                jest.spyOn(User, 'findOne').mockImplementation(() => Promise.resolve(user));
                jest.spyOn(Task.prototype, 'validateSync').mockImplementation(() => null);
                jest.spyOn(Task.prototype, 'save').mockImplementation(() => Promise.resolve(updatedTask));
                const result = await taskService.updateTask(taskId, requestingUser._id.toString(), {
                    todo: updatedTask.todo
                });
                expect(result).toBeInstanceOf(Task);
                expect(result.todo).toBe(updatedTask.todo);
            });


    });
});


describe('taskService (admin)', function () {

    beforeEach(function () {
        mockingoose.resetAll();
        jest.restoreAllMocks();
    });

    describe('findAll', function () {
        it('returns all tasks', async function () {
            const task1 = new Task({todo: 'task one'});
            const task2 = new Task({todo: 'task two', userId: randomUUID()});
            mockingoose(Task).toReturn([task1, task2], 'find');
            const result = await taskService.findAll();
            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBe(2);
        });
    });

    describe('assignTaskToUser', function () {
        test.each(invalidIds)(
            'given an invalid taskId it should throw a ValidationError',
            async function (taskId) {
                await expect(taskService.assignTaskToUser(taskId, randomUUID()))
                    .rejects.toThrow(ValidationError);
            });

        test.each(invalidIds)(
            'given an invalid userId it should throw a ValidationError',
            async function (userId) {
                await expect(taskService.assignTaskToUser(randomUUID(), userId))
                    .rejects.toThrow(ValidationError);
            });

        it('throws a NotFoundError when the task does not exist', async function () {
            mockingoose(Task).toReturn(null, 'findOne');
            await expect(taskService.assignTaskToUser(randomUUID(), randomUUID()))
                .rejects.toThrow(NotFoundError);
        });

        it('throws a NotFoundError when the user does not exist', async function () {
            const task = new Task({todo: 'do something'});
            mockingoose(Task).toReturn(task, 'findOne');
            mockingoose(User).toReturn(null, 'findOne');
            await expect(taskService.assignTaskToUser(task._id, randomUUID()))
                .rejects.toThrow(NotFoundError);
        });

        it('saves the userId in the task when everything is correct', async function () {
            const user = new User({username: 'testuser', password: 'password', roles: ['user']});
            const task = new Task({todo: 'do something'});
            mockingoose(Task).toReturn(task, 'findOne');
            mockingoose(User).toReturn(user, 'findOne');
            jest.spyOn(Task.prototype, 'save').mockImplementation(function () {
                return Promise.resolve(this);
            });
            const result = await taskService.assignTaskToUser(task._id, user._id);
            expect(result.userId).toBe(user._id);
        });
    });
});
