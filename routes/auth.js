const express = require("express");
const router = express.Router();
const isAuthenticated = require("../isAuth")

const loginController = require("../controller/loginController");
const signupController = require("../controller/signupController");

router.get("/signup", signupController.signup_get);
router.post("/signup", signupController.signup_post);

router.get("/login", loginController.login_get);
router.post("/login", loginController.login_post);
router.get("/logout", isAuthenticated, loginController.logout);
module.exports = router;

