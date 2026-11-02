const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const mockingoose = require('mockingoose');
const User = require('../../models/userModel');

const userService = require('../../services/userService');

beforeEach(function () {
    mockingoose.resetAll();
    jest.restoreAllMocks();
});

describe('userService', function () {
    describe('findAll', function () {
        it('returns all users', async function () {
            const user1 = new User({username: 'user1', password: 'password1', roles: ['user']});
            const user2 = new User({username: 'admin1', password: 'password2', roles: ['admin']});
            mockingoose(User).toReturn([user1, user2], 'find');
            const result = await userService.findAll();
            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBe(2);
        });

        it('returns an empty array when there are no users', async function () {
            mockingoose(User).toReturn([], 'find');
            const result = await userService.findAll();
            expect(result).toEqual([]);
        });
    });
});
