const { validationResult } = require("express-validator");
const { User } = require("../models/User");
const { Profile } = require("../models/Profile");
const { signAccessToken } = require("../utils/jwt");

async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid input", errors: errors.array() });

  const { name, email, password } = req.body;
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) return res.status(409).json({ message: "Email already in use" });

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role: "student" });

  // create empty profile
  await Profile.create({ userId: user._id });

  const token = signAccessToken(user);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid input", errors: errors.array() });

  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await user.verifyPassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signAccessToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

async function me(req, res) {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
}

module.exports = { register, login, me };

