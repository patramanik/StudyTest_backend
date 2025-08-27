const { User } = require("../../models");
const hashPassword = require("../utils/hashPassword");
const comparePassword = require("../utils/comparePassword");
const generateToken = require("../utils/generateToken");
const generateCode = require("../utils/generateCode");
const sendEmail = require("../utils/sendEmail");

const signup = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName) {
      res
        .status(400)
        .json({ code: 400, status: false, message: "FullName is required" });
      return;
    }

    if (!email) {
      res
        .status(400)
        .json({ code: 400, status: false, message: "Email is required" });
      return;
    }

    if (!password) {
      res
        .status(400)
        .json({ code: 400, status: false, message: "Password is required" });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        code: 409,
        status: false,
        message: "Email already registered",
      });
    }
    // Logic for user signup
    const hashedPassword = await hashPassword(password);
    // Create user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      code: 201,
      status: true,
      message: "User registered successfully",
      data: { User: newUser },
    });
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ code: 400, status: false, message: "Email is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      return res
        .status(404)
        .json({ code: 404, status: false, message: "User not found" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ code: 400, status: false, message: "Password is required" });
    }

    // Check if password is correct
    const isPasswordCorrect = await comparePassword(
      password,
      existingUser.password
    );

    // If password is incorrect, return error
    if (!isPasswordCorrect) {
      res.code = 401;
      throw new Error(`Invalid password`);
    }

    // Update the lastLogin time for the specific user
    await User.update(
      { lastLogin: new Date() }, // Data to update
      { where: { id: existingUser.id } } // Where to update
    );
    // Generate token
    const token = await generateToken(existingUser);

    // If everything is fine, user logged in successfully
    res.status(200).json({
      code: 200,
      status: true,
      message: "User signin in successfully",
      user: {
        id: existingUser.id,
        fullName: existingUser.fullName,
        email: existingUser.email,
        isActive: existingUser.isActive,
        lastLogin: existingUser.lastLogin,
        profilePicture: existingUser.profilePicture,
      },
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  signin,
};
