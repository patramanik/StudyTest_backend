const { User } = require('../../models');
const hashPassword = require("../utils/hashPassword");

const signup =async (req, res, next) => {
  try {

    const { fullName, email, password, role } = req.body;

    if (!fullName) {
      res.status(400).json({ code: 400, status: false, message: 'FullName is required' });
      return;
    }

    if (!email) {
      res.status(400).json({ code: 400, status: false, message: 'Email is required' });
      return;
    }
    
    if (!password) {
      res.status(400).json({ code: 400, status: false, message: 'Password is required' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ code: 409, status: false, message: 'Email already registered' });
    }
    // Logic for user signup
    const hashedPassword = await hashPassword(password);
     // Create user
    const newUser = await User.create({ fullName, email, password: hashedPassword, role });
  
    res.status(201).json({
      code: 201,
      status: true,
      message: 'User registered successfully',
      data: { User: newUser },
    });
  } catch (error) {
    next(error);
  }
};

const signin = (req, res, next) => {
  try {
    // Logic for user signin
    res.status(200).json({ message: "User signed in successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  signin,
};
