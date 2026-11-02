const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

async function connectMongoose(dbConnection, dbConnectionOptions) {
    return await mongoose.connect(dbConnection, dbConnectionOptions);
}

module.exports = connectMongoose;


