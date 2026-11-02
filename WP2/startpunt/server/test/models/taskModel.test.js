const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const {MongoMemoryServer} = require('mongodb-memory-server');

const ObjectId = mongoose.Types.ObjectId;
const Task = require('../../models/taskModel');
const User = require('../../models/userModel');

const invalidNewTasks = [
    {todo: ''}, {todo: '.'}, {todo: 'a.b'}, {todo: 'a.b'},
    {todo: '', compleed: true}, {todo: '.', completed: true},
    {todo: 'a.b', completed: true}, {todo: 'a.b', completed: true},
    {todo: 'new todo', completed: 'ok'}
];

const validNewTasks = [
    {todo: 'todo1', completed: true}, {todo: 'todo1', completed: 1},
    {todo: 'todo1'}, {todo: 'todo2', completed: false}
];

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {});
    await User.init();
    await Task.init();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Task.deleteMany({});
    await User.deleteMany({});
});

describe('taskModel', () => {
    describe('save', () => {
        test.each(invalidNewTasks)(
            'given an invalid new task (without userId) it should throw a ValidationError',
            async (newTask) => {
                await expect(new Task(newTask).save()).rejects.toThrow(mongoose.Error.ValidationError);
            }
        );

        test.each(invalidNewTasks)(
            'given an invalid new task (with userId) it should throw a ValidationError',
            async (newTask) => {
                const user = new User({username: 'user', password: 'username', roles: ['user']});
                await user.save();
                newTask.userId = user._id;
                await expect(new Task(newTask).save()).rejects.toThrow(mongoose.Error.ValidationError);
            }
        );

        test.each(validNewTasks)(
            'given a valid new Task (without userId) it should save this task',
            async (newTask) => {
                let task = new Task(newTask);
                await task.save();
                expect(task._id).toBeInstanceOf(ObjectId);
            }
        );

        test.each(validNewTasks)(
            'given a valid new Task (with userId) it should save this task',
            async (newTask) => {
                const user = new User({username: 'username', password: 'password123', roles: ['user']});
                await user.save();
                newTask.userId = user._id;
                let task = new Task(newTask);
                await task.save();
                expect(task._id).toBeInstanceOf(ObjectId);
            }
        );
    });
});

