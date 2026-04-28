const jwt = require("jsonwebtoken");

function signAccessToken(user) {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn }
  );
}

module.exports = { signAccessToken };

