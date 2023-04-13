const express = require('express')
const router = express.Router()

const {signUp, login, logout, forgotPassword, resetPassword} = require("../controllers/auth.controller");

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);

module.exports = router;