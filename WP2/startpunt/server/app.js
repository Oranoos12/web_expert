const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const dotenv = require("dotenv");
dotenv.config();
const ENV = process.env.ENV;
const PORT = process.env.PORT;
const DATABASE_CONNECTION = process.env.DATABASE_CONNECTION;
const DB_CONNECTION_OPTIONS = JSON.parse(process.env.DATABASE_CONNECTION_OPTIONS);
const CORS_OPTIONS = JSON.parse(process.env.CORS_OPTIONS);
const loadExpress = require('./loaders/express');
const connectMongoose = require('./loaders/database');
const log = require('./loaders/logger')(ENV);
const app = loadExpress(CORS_OPTIONS);


let server;

async function startServer() {
    await connectMongoose(DATABASE_CONNECTION, DB_CONNECTION_OPTIONS);

    server = app.listen(PORT, () => {
        log(`Server running at http://localhost:${PORT}`);
    });

    server.on('error', async (err) => {
        log(`Server failed to start: ${err.message}`);
        await shutdown('Server error');
    });
}

async function shutdown(reason) {
    try {
        log(`Shutting down due to: ${reason}`);
        if (server) {
            server.close(() => log('Server closed.'));
        }

        if (mongoose.connection.readyState) {
            await mongoose.connection.close();
            log('MongoDB connection closed.');
        }
        setTimeout(() => {
            log('Exiting process.');
            process.exit(0);
        }, 1000);

    } catch (err) {
        log(`Error during shutdown: ${err.message}`);
        process.exit(1);
    }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();

