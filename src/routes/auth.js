const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");
const validate = require("../validetors/validate");
// const isAuth = require("../middlewares/isAuth");
const { signinValidator} = require("../validetors/auth");


//router
router.post("/signup", validate, authController.signup);

router.post("/signin",signinValidator,validate,authController.signin);


module.exports = router;