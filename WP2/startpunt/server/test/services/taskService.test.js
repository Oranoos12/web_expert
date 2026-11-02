const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const mockingoose = require('mockingoose');
const ObjectId = mongoose.Types.ObjectId;
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
                    _id: new ObjectId(),
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
            const taskId = new ObjectId().toString();
            mockingoose(Task).toReturn(null, 'findOne');
            mockingoose(User).toReturn(user, 'findOne');
            await expect(taskService.updateTask(taskId, requestingUser._id.toString(), {completed: true}))
                .rejects.toThrow(NotFoundError);
        });

        it('throws an AuthorisationError when the task doesn\'t belong to the user', async () => {
            const user = new User({username: 'testuser', password: 'password', roles: ['user']});
            const requestingUser = {_id: user._id, username: user.username, roles: user.roles};
            const task = new Task({todo: 'do something', userId: new ObjectId()});
            const taskId = task._id.toString();
            mockingoose(Task).toReturn(task, 'findOne');
            mockingoose(User).toReturn(user, 'findOne');
            await expect(taskService.updateTask(taskId, requestingUser._id.toString(), {completed: true}))
                .rejects.toThrow(AuthorisationError);
        });

        it('throws an AuthorisationError when a regular user tries to reassign the task', async () => {
            const user = new User({username: 'testuser', password: 'password', roles: ['user']});
            const requestingUser = {_id: user._id, username: 'testuser', roles: ['user']};
            const task = new Task({todo: 'do something', userId: new ObjectId()});
            const updatedTask = new Task({task: task.todo, userId: task.userId, completed: true});
            const taskId = task._id.toString();
            task.userId = user._id;
            mockingoose(Task).toReturn(task, 'findOne');
            mockingoose(User).toReturn(user, 'findOne');
            await expect(taskService.updateTask(taskId, requestingUser._id.toString(), {userId: new ObjectId()}))
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
                const task = new Task({todo: 'do something', userId: new ObjectId()});
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
                const task = new Task({todo: 'do something', userId: new ObjectId()});
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

