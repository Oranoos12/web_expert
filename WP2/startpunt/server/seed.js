const dotenv = require("dotenv");
dotenv.config();

const DATABASE_CONNECTION = process.env.DATABASE_CONNECTION;
const DB_CONNECTION_OPTIONS = JSON.parse(process.env.DATABASE_CONNECTION_OPTIONS);

const Task = require('./models/taskModel.js');
const User = require('./models/userModel.js');
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
console.log(DATABASE_CONNECTION);
console.log(DB_CONNECTION_OPTIONS);
mongoose.connect(DATABASE_CONNECTION, DB_CONNECTION_OPTIONS).catch((error) => {
    console.error(error.message);
    cleanup();
});


async function run() {
    try {
        await Task.init();
        await User.init();
        await Task.deleteMany({});
        await User.deleteMany({});
        let user1 = new User({username: 'user', password: 'user123', roles: ['user']});
        await user1.save();
        let user2 = new User({username: 'admin', password: 'admin123', roles: ['admin']});
        await user2.save();
        let task1 = new Task({todo: 'clean your room'});
        await task1.save();
        let task2 = new Task({todo: 'homework'});
        await task2.save();
        let task3 = new Task({todo: 'wash the car'});
        await task3.save();
        task1.userId = user1._id;
        await task1.save();
        task2.userId = user1._id;
        await task2.save();

        let users = await User.find({});
        console.log('users');
        console.log(users);
        let tasks = await Task.find({});
        console.log('tasks');
        console.log(tasks);
    } catch (error) {
        console.log(error.message);
    } finally {
        await mongoose.connection.close();
    }
}

run().catch((err) => {
    console.log(err.stack);
});
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function cleanup() {
    console.log('\nBye!');
    mongoose.connection.close();
    process.exit();
}

