const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const {MongoMemoryServer} = require('mongodb-memory-server');

const ObjectId = mongoose.Types.ObjectId;
const User = require('../../models/userModel');

const validCredentialsNewUser = [
    {username: 'user1', password: 'password1'},
    {username: 'user2', password: 'aaAA__'},
    {username: 'user3', password: 'aaAA__', roles: ['admin']}
];

const invalidCredentialsUser = [
    {username: 'wronguser1'},
    {password: 'Wrongpassword1'},
    {username: 'a', password: 'Wrongpassword2'},
    {username: 'Wronguser1', password: '.'},
    {
        username: 'Wronguser1',
        password: 'looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooongWrongpassword1'
    },
    {username: 'Wronguser1', password: 'Wrongpassword1', roles: ['wrong']},
    {username: 'Wronguser1', password: 'Wrongpassword1', roles: ['admin', 'wrong']}
];

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {});
    await User.init();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await User.deleteMany({});
});

describe('userModel', () => {
    describe('save', () => {
        test.each(validCredentialsNewUser)(
            'given valid credentials it should create a new user',
            async (credential) => {
                let user = new User(credential);
                await user.save();
                expect(user._id).toBeInstanceOf(ObjectId);
            }
        );

        test.each(validCredentialsNewUser)(
            'given valid credentials saving the user twice throws a MongoServerError',
            async (credential) => {
                let user = new User(credential);
                await user.save();
                let user2 = new User(credential);
                await expect(user2.save()).rejects.toThrow(mongoose.Error.MongoServerError);
            }
        );

        test.each(invalidCredentialsUser)(
            'given invalid credentials it should throw a ValidationError',
            async (credential) => {
                let user = new User(credential);
                await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
            }
        );
    });

    describe("findOneByCredentials", () => {
        test.each(invalidCredentialsUser)(
            "given invalid credentials it should return null",
            async (credential) => {
                let username = credential.username;
                let password = credential.password;
                let result = await User.findOneByCredentials(username, password);
                expect(result).toEqual(null);
            }
        );

        test.each(validCredentialsNewUser)(
            "given valid credentials of an unsaved user it should return null",
            async (credential) => {
                let result = await User.findOneByCredentials(credential.username, credential.password);
                expect(result).toEqual(null);
            }
        );

        test.each(validCredentialsNewUser)(
            "given the username of a user in the database and wrong password it should return null",
            async (credential) => {
                let user = new User(credential);
                await user.save();
                let result = await User.findOneByCredentials(credential.username, "wrong__passwo");
                expect(result).toEqual(null);
            }
        );

        test.each(validCredentialsNewUser)(
            "given the credentials of a user in the database it should find the user",
            async (credential) => {
                let user = new User(credential);
                await user.save();
                let result = await User.findOneByCredentials(credential.username, credential.password);
                expect(result._id).toEqual(user._id);
            }
        );
    });
});

