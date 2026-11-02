const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minLength: 2,
            maxLength: 20,
            validate: {
                validator: function (value) {
                    return /^[a-zA-Z0-9_]+$/.test(value);
                },
                message: (props) => `${props.value} is not a valid username`
            }
        },
        roles: {
            type: [String],
            enum: ['user', 'admin'],
            default: ['user']
        },
        hashedPassword: {
            type: String,
            required: true
        }
    },
    {collection: 'users'}
);

userSchema
    .virtual('password')
    .set(function (password) {
        password = password.trim();
        if (password.length < 6) {
            this.invalidate('password', 'must be at least 6 characters.');
        }
        if (password.length > 20) {
            this.invalidate('password', 'must be shorter than 20 characters.');
        }
        this.hashedPassword = bcrypt.hashSync(password, 8);
    });

userSchema.statics.findOneByCredentials = async function (username, password) {
    const user = await this.findOne({username});
    if (!user) {
        return null;
    }
    let passwordIsCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordIsCorrect) {
        return null;
    }
    return user;
};

module.exports = mongoose.model('User', userSchema);

