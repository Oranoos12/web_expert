const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const ObjectId = mongoose.Types.ObjectId;
const Task = require('../../models/taskModel');
const User = require('../../models/userModel');

const userService = require('../../services/securityService');
const {NotFoundError, ValidationError, AuthenticationError} = require('../../errors/error');

const {invalidIds} = require('./data'); 

beforeEach(async () => {
    jest.clearAllMocks();
});

describe('securityService', () => {
    describe('findByCredentials', () => {
        it('should throw an AuthenticationError given incorrect credentials', async () => {
            jest.spyOn(User, 'findOneByCredentials').mockImplementation(() => Promise.resolve(null));
            await expect(userService.findByCredentials('username', 'password')).rejects.toThrow(AuthenticationError);
        });

        it('should return the user given correct credentials', async () => {
            const user = new User({username: 'username', password: 'password'});
            jest.spyOn(User, 'findOneByCredentials').mockImplementation(() => Promise.resolve(user));
            const result = await userService.findByCredentials('username', 'password');
            expect(result).toBeInstanceOf(User);
            expect(result._id.toString()).toBe(user._id.toString());
        });
    });
});
    
