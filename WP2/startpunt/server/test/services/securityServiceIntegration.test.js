const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const {MongoMemoryServer} = require('mongodb-memory-server');

const User = require('../../models/userModel');
const securityService = require('../../services/securityService');
const {AuthenticationError, ValidationError} = require("../../errors/error");

const {usersIncludingPasswords} = require('./data');
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
    users = [];
    for (let user of usersIncludingPasswords) {
        let newUser = await (new User(user).save());
    }
});

describe("securityService", () => {
    it('should throw an AuthenticationError given incorrect credentials for an existing user', async () => {
        await expect(securityService.findByCredentials(usersIncludingPasswords[0].username, 'wrongpassword')).rejects.toThrow(AuthenticationError);
    });

    it('should throw an AuthenticationError given incorrect credentials', async () => {
        await expect(securityService.findByCredentials('nonexistinguser', 'wrongpassword')).rejects.toThrow(AuthenticationError);
    });

    it('should return the user given correct credentials', async () => {
        const result = await securityService.findByCredentials(usersIncludingPasswords[0].username, usersIncludingPasswords[0].password);
        expect(result).toBeInstanceOf(User);
    });
});
