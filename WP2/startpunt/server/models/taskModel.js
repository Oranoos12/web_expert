const mongoose = require('mongoose');
const {randomUUID} = require('crypto');

const taskSchema = new mongoose.Schema(
    {
        // uuid in plaats van ObjectId
        _id: {
            type: String,
            default: randomUUID
        },
        todo: {
            type: String,
            trim: true,
            validate: {
                validator: function (value) {
                    return /^[A-Za-z0-9 ]+$/.test(value);
                },
                message: (props) => `${props.value} is not a valid todo`
            },
            required: [true, 'Todo is required']
        },
        completed: {
            type: Boolean,
            default: false
        },
        // verwijst naar het _id (uuid) van een user
        userId: {
            type: String,
            ref: 'User'
        }
    },
    {
        collection: 'tasks'
    }
);
module.exports = mongoose.model('Task', taskSchema);


