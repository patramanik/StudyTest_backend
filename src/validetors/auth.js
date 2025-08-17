const { check } = require("express-validator");
const validateEmail = require("./validateEmail");

const singupValidator = [
  check("name").not().isEmpty().withMessage("name is required"),
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Email is required"),
  check("password")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long")
    .notEmpty()
    .withMessage("password is required"),
];

const signinValidator = [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Email is required"),
  check("password").notEmpty().withMessage("Password is not empty"),
];

const emailValidator = [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Email is required"),
];

const verifyUserValidator = [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Email is required"),

  check("code").notEmpty().withMessage("verificationCode is required"),
];

const recoverPasswordValidator = [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Email is required"),

  check("code").notEmpty().withMessage("verificationCode is required"),

  check("password")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long")
    .notEmpty()
    .withMessage("password is required"),
];

const changePasswordValidator = [
  check("oldPassword").notEmpty().withMessage("Old Password is required"),

  check("newPassword")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long")
    .notEmpty()
    .withMessage("password is required"),
];

const updateProfileValidator = [
  check("email").custom(async (email) => {
    if (email) {
      const isValidEmail = validateEmail(email);

      if (!isValidEmail) {
        throw new Error("Please enter a valid email address");
      }
    }
  }),
];

module.exports = {
  singupValidator,
  signinValidator,
  emailValidator,
  verifyUserValidator,
  recoverPasswordValidator,
  changePasswordValidator,
  updateProfileValidator,
};
