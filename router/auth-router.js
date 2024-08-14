const express=require("express");
const router=express.Router();
const control = require("../controllers/auth-controller");
const userMiddleware = require("../middlewares/user-auth-middleware");

// compare user registration  form vs validation its means signSchema
const  {signupSchema,loginSchema} = require ("../validators/auth-validator");
const validate = require("../middlewares/auth-middleware");

router.route("/").get(control.home);
router.route("/register").post(validate(signupSchema),control.register); 
router.route("/login").post(validate(loginSchema),control.login); 
router.route("/user").get(userMiddleware,control.user); 

module.exports = router;
