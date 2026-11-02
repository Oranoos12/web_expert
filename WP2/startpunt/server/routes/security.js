const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const router = express.Router();
const securityController = require("../controllers/securityController");
const {authenticate, authorize} = require("../middleware/authentication");

router.post("/login",
    bodyParser.json(),
    (req, res, next) => {
        req.body = req.body || {};
        next();
    },
    securityController.login
);

router.post("/login/check",
    cookieParser(),
    authenticate,
    securityController.checkLogin
);

router.post("/logout",
    cookieParser(),
    authenticate,
    securityController.logout
);

module.exports = router;
