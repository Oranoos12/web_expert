const dotenv = require("dotenv");
dotenv.config();
const {MongoClient} = require("mongodb");
const {MongoMemoryServer} = require("mongodb-memory-server");

const request = require("supertest");
const mongoose = require("mongoose");

const loadExpress = require("../../loaders/express.js");
const DATABASE_CONNECTION = process.env.DATABASE_CONNECTION_TEST;
const DB_CONNECTION_OPTIONS = JSON.parse(process.env.DATABASE_CONNECTION_OPTIONS);
const CORS_OPTIONS = JSON.parse(process.env.CORS_OPTIONS);

const {usersIncludingPasswords, admin, tasks} = require("./data");

let mongServer, uri, client, app;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
    await mongoose.connect(uri, {});
    app = loadExpress(CORS_OPTIONS);
    client = new MongoClient(uri);
    await client.connect();
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
    await client.close();
});

async function resetDatabase() {
    const dbName = mongoose.connection.db.databaseName;
    db = client.db(dbName);
    await db.dropDatabase();
    await db.collection('users').insertMany(
        usersIncludingPasswords.map((u) => ({
            _id: u._id,
            username: u.username,
            roles: u.roles,
            hashedPassword: u.hashedPassword,
        }))
    );
    await db.collection('users').insertOne({
        _id: admin._id,
        username: admin.username,
        roles: admin.roles,
        hashedPassword: admin.hashedPassword,
    });
    await db.collection('tasks').insertMany(tasks);
}

// inloggen en de token uit de cookie teruggeven
async function login(username, password) {
    const response = await request(app)
        .post("/security/login")
        .send({username, password});
    const cookie = response.headers['set-cookie'].pop().split(';')[0];
    return cookie.substring(6);
}

describe("app", () => {

    describe("POST /security/login", () => {
        usersIncludingPasswords.forEach((user, index) => {
            it(`should return statuscode 401 when an incorrect password is provided for user ${index + 1}`, async () => {
                await resetDatabase();
                const {username} = user;
                await request(app)
                    .post("/security/login")
                    .send({username, password: "incorrectpassword"})
                    .expect(401);
            });

            it(`should return statuscode 200 and user and token if username and password are correct for user ${index + 1}`, async () => {
                await resetDatabase();
                const {username, password} = user;
                const response = await request(app)
                    .post("/security/login")
                    .send({username, password});
                const cookie = response.headers['set-cookie'].pop().split(';')[0];
                expect(cookie).toMatch(/^token=/);
                const token = cookie.substring(6);
                const responseUser = response.body;
                expect(responseUser).toBeDefined();
                expect(token).toBeDefined();
                expect(responseUser.username).toEqual(username);
            });
        });
    });

    describe("POST /security/login/check", () => {
        usersIncludingPasswords.forEach((user, index) => {
            it(`should return statuscode 401 when no token is provided for user ${index + 1}`, async () => {
                await resetDatabase();
                await request(app)
                    .post("/security/login/check")
                    .expect(401);
            });

            it(`should return statuscode 200 and user when a valid token is presented for user ${index + 1}`, async () => {
                await resetDatabase();
                const {username, password} = user;
                const response = await request(app)
                    .post("/security/login")
                    .send({username, password});
                const cookie = response.headers['set-cookie'].pop().split(';')[0];
                expect(cookie).toMatch(/^token=/);
                const token = cookie.substring(6);
                const checkResponse = await request(app)
                    .post("/security/login/check")
                    .set("Cookie", [`token=${token}`])
                    .send()
                    .expect(200);
                const responseUser = response.body;
                expect(responseUser).toBeDefined();
                expect(responseUser.username).toEqual(username);
                expect(responseUser._id.toString()).toEqual(user._id.toString());
            });

            it(`should return statuscode 401 when an invalid token is provided for user ${index + 1}`, async () => {
                await resetDatabase();
                const token = "invalidtoken";
                await request(app)
                    .post("/security/login/check")
                    .set("Cookie", [`token=${token}`])
                    .send()
                    .expect(401);
            });
        });
    });

    describe("GET /task", () => {
        usersIncludingPasswords.forEach((user, index) => {
            it(`should return statuscode 401 if no token is provided for user ${index + 1}`, async () => {
                await resetDatabase();
                await request(app)
                    .get(`/task`)
                    .expect(401);
            });

            it(`should return statuscode 401 when an invalid token is provided for user ${index + 1}`, async () => {
                await resetDatabase();
                const token = "invalidtoken";
                await request(app)
                    .get(`/task`)
                    .set("Cookie", [`token=${token}`])
                    .send()
                    .expect(401);
            });

            it(`should return statuscode 401 when an invalid token is provided for user ${index + 1}`, async () => {
                await resetDatabase();
                const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";
                await request(app)
                    .get(`/task`)
                    .set("Cookie", [`token=${token}`])
                    .send()
                    .expect(401);
            });


            it(`should return statuscode 200 and the tasks when a valid token is provided for user ${index + 1}`, async () => {
                await resetDatabase();
                const {username, password} = user;
                const response = await request(app)
                    .post("/security/login")
                    .send({username, password});
                const responseUser = response.body;
                const cookie = response.headers['set-cookie'].pop().split(';')[0];
                expect(cookie).toMatch(/^token=/);
                const token = cookie.substring(6);
                const response2 = await request(app)
                    .get(`/task/`)
                    .set("Cookie", [`token=${token}`])
                    .send();
                const actualTasks = response2.body;
                const actualTaskIds = actualTasks.map((t) => t._id.toString());
                const expectedTaskIds = tasks
                    .filter((t) => t.userId?.toString() === responseUser._id.toString())
                    .map((t) => t._id.toString());
                expect(actualTaskIds.sort()).toEqual(expectedTaskIds.sort());
            });
        });
    });

    describe("PATCH /task/:taskId", () => {
        tasks.forEach((task, index) => {
            it(`should return statuscode 401 if no token is provided for task ${index + 1}`, async () => {
                await resetDatabase();
                await request(app)
                    .patch(`/task/{index}`)
                    .expect(401);
            });

            it(`should return statuscode 401 when an invalid token is provided for task ${index + 1}`, async () => {
                await resetDatabase();
                const token = "invalidtoken";
                await request(app)
                    .patch(`/task/{index}`)
                    .set("Cookie", [`token=${token}`])
                    .send()
                    .expect(401);
            });

            it(`should return statuscode 401 when an invalid token is provided for task ${index + 1}`, async () => {
                await resetDatabase();
                const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";
                await request(app)
                    .patch(`/task/{index}`)
                    .set("Cookie", [`token=${token}`])
                    .send()
                    .expect(401);
            });

            if (task.userId) {
                it(`should return statuscode 200 and the updated task when a valid token is provided for task ${index + 1}`, async () => {
                    await resetDatabase();
                    const user = usersIncludingPasswords.find(u => u._id.toString() === task.userId.toString())
                    const {username, password} = user;
                    const response = await request(app)
                        .post("/security/login")
                        .send({username, password});
                    const responseUser = response.body;
                    const cookie = response.headers['set-cookie'].pop().split(';')[0];
                    expect(cookie).toMatch(/^token=/);
                    const token = cookie.substring(6);
                    const response2 = await request(app)
                        .patch(`/task/${task._id.toString()}`)
                        .set("Cookie", [`token=${token}`])
                        .send({completed: !task.completed})
                        .expect(200)
                    const updatedTask = response2.body;
                    expect(updatedTask.completed).toBe(!task.completed)
                });

                it(`should return statuscode 400 for invalid completed for task ${index + 1}`, async () => {
                    await resetDatabase();
                    const user = usersIncludingPasswords.find(u => u._id.toString() === task.userId.toString())
                    const {username, password} = user;
                    const response = await request(app)
                        .post("/security/login")
                        .send({username, password});
                    const responseUser = response.body;
                    const cookie = response.headers['set-cookie'].pop().split(';')[0];
                    expect(cookie).toMatch(/^token=/);
                    const token = cookie.substring(6);
                    const response2 = await request(app)
                        .patch(`/task/${task._id.toString()}`)
                        .set("Cookie", [`token=${token}`])
                        .send({completed: "invalid value"})
                        .expect(400)
                });


                it(`should return statuscode 403 if a another user updates the task ${index + 1}`, async () => {
                    await resetDatabase();
                    const user = usersIncludingPasswords.find(u => u._id.toString() !== task.userId.toString())
                    const {username, password} = user;
                    const response = await request(app)
                        .post("/security/login")
                        .send({username, password});
                    const responseUser = response.body;
                    const cookie = response.headers['set-cookie'].pop().split(';')[0];
                    expect(cookie).toMatch(/^token=/);
                    const token = cookie.substring(6);
                    const response2 = await request(app)
                        .patch(`/task/${task._id.toString()}`)
                        .set("Cookie", [`token=${token}`])
                        .send({completed: true})
                        .expect(403)
                });
            }
        });
    });


});

describe("app (admin)", function () {

    describe("GET /task/all", function () {
        it("should return statuscode 401 if no token is provided", async function () {
            await resetDatabase();
            await request(app)
                .get("/task/all")
                .expect(401);
        });

        it("should return statuscode 403 if a user (not admin) asks all tasks", async function () {
            await resetDatabase();
            const token = await login(usersIncludingPasswords[0].username, usersIncludingPasswords[0].password);
            await request(app)
                .get("/task/all")
                .set("Cookie", [`token=${token}`])
                .expect(403);
        });

        it("should return statuscode 200 and all tasks for the admin", async function () {
            await resetDatabase();
            const token = await login(admin.username, admin.password);
            const response = await request(app)
                .get("/task/all")
                .set("Cookie", [`token=${token}`])
                .expect(200);
            expect(response.body.length).toBe(tasks.length);
        });
    });

    describe("GET /user", function () {
        it("should return statuscode 401 if no token is provided", async function () {
            await resetDatabase();
            await request(app)
                .get("/user")
                .expect(401);
        });

        it("should return statuscode 403 if a user (not admin) asks all users", async function () {
            await resetDatabase();
            const token = await login(usersIncludingPasswords[0].username, usersIncludingPasswords[0].password);
            await request(app)
                .get("/user")
                .set("Cookie", [`token=${token}`])
                .expect(403);
        });

        it("should return statuscode 200 and all users without password for the admin", async function () {
            await resetDatabase();
            const token = await login(admin.username, admin.password);
            const response = await request(app)
                .get("/user")
                .set("Cookie", [`token=${token}`])
                .expect(200);
            // 2 users + 1 admin
            expect(response.body.length).toBe(usersIncludingPasswords.length + 1);
            expect(response.body[0].username).toBeDefined();
            expect(response.body[0].hashedPassword).toBeUndefined();
        });
    });

    describe("PATCH /task/:taskId/user", function () {
        const task = tasks[2];
        const user = usersIncludingPasswords[1];

        it("should return statuscode 401 if no token is provided", async function () {
            await resetDatabase();
            await request(app)
                .patch(`/task/${task._id}/user`)
                .send({userId: user._id})
                .expect(401);
        });

        it("should return statuscode 403 if a user (not admin) assigns a task", async function () {
            await resetDatabase();
            const token = await login(user.username, user.password);
            await request(app)
                .patch(`/task/${task._id}/user`)
                .set("Cookie", [`token=${token}`])
                .send({userId: user._id})
                .expect(403);
        });

        it("should return statuscode 200 and the task with the new userId for the admin", async function () {
            await resetDatabase();
            const token = await login(admin.username, admin.password);
            const response = await request(app)
                .patch(`/task/${task._id}/user`)
                .set("Cookie", [`token=${token}`])
                .send({userId: user._id})
                .expect(200);
            expect(response.body.userId).toBe(user._id);
        });

        it("should return statuscode 400 if the userId is not a uuid", async function () {
            await resetDatabase();
            const token = await login(admin.username, admin.password);
            await request(app)
                .patch(`/task/${task._id}/user`)
                .set("Cookie", [`token=${token}`])
                .send({userId: "123"})
                .expect(400);
        });

        it("should return statuscode 400 if no body is sent", async function () {
            await resetDatabase();
            const token = await login(admin.username, admin.password);
            await request(app)
                .patch(`/task/${task._id}/user`)
                .set("Cookie", [`token=${token}`])
                .expect(400);
        });

        it("should return statuscode 404 if the task does not exist", async function () {
            await resetDatabase();
            const token = await login(admin.username, admin.password);
            await request(app)
                .patch("/task/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/user")
                .set("Cookie", [`token=${token}`])
                .send({userId: user._id})
                .expect(404);
        });

        it("should return statuscode 404 if the user does not exist", async function () {
            await resetDatabase();
            const token = await login(admin.username, admin.password);
            await request(app)
                .patch(`/task/${task._id}/user`)
                .set("Cookie", [`token=${token}`])
                .send({userId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"})
                .expect(404);
        });
    });
});
