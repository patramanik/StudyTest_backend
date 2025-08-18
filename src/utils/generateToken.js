const jwt = require("jsonwebtoken");
// const { jwtSecret } = require("../config/kyes");
const generateToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET
  const token = jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: "7d",
    }
  );

  return token;
};



module.exports = generateToken;