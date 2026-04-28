const { validationResult } = require("express-validator");
const { Profile } = require("../models/Profile");
const { Connection } = require("../models/Connection");
const { User } = require("../models/User");

async function getMyProfile(req, res) {
  const profile = await Profile.findOne({ userId: req.user._id }).lean();
  res.json({ profile });
}

async function upsertMyProfile(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid input", errors: errors.array() });

  const update = req.body;
  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: update },
    { new: true, upsert: true }
  );
  res.json({ profile });
}

async function getProfileByUserId(req, res) {
  const { userId } = req.params;
  const profile = await Profile.findOne({ userId }).lean();
  if (!profile) return res.status(404).json({ message: "Profile not found" });
  const user = await User.findById(userId).select("_id name email role").lean();
  res.json({ profile, user });
}

async function searchStudents(req, res) {
  const q = (req.query.q || "").toString().trim();
  const department = (req.query.department || "").toString().trim();

  const filters = {};
  if (department) filters.department = new RegExp(department, "i");

  const profiles = await Profile.find(filters)
    .sort({ updatedAt: -1 })
    .limit(30)
    .lean();

  // optionally apply name/email query
  let usersById = {};
  if (profiles.length) {
    const ids = profiles.map((p) => p.userId);
    const [users, myConnections] = await Promise.all([
      User.find({ _id: { $in: ids } }).select("_id name email").lean(),
      Connection.find({ fromUserId: req.user._id, toUserId: { $in: ids } }).select("toUserId status").lean(),
    ]);
    usersById = Object.fromEntries(users.map((u) => [u._id.toString(), u]));
    const connectionStatusByUserId = Object.fromEntries(
      myConnections.map((c) => [c.toUserId.toString(), c.status])
    );
    let results = profiles.map((p) => ({
      profile: p,
      user: usersById[p.userId.toString()],
      connectionStatus: connectionStatusByUserId[p.userId.toString()] || null,
    })).filter((r) => r.user);

    if (q) {
      const re = new RegExp(q, "i");
      results = results.filter((r) => re.test(r.user.name));
    }

    return res.json({ results });
  }
  res.json({ results: [] });
}

module.exports = { getMyProfile, upsertMyProfile, getProfileByUserId, searchStudents };

