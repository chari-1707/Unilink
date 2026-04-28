const { Event } = require("../models/Event");
const { Connection } = require("../models/Connection");
const { Message } = require("../models/Message");
const { Notification } = require("../models/Notification");
const { Post } = require("../models/Post");
const { Profile } = require("../models/Profile");
const { User } = require("../models/User");

async function listUsers(_req, res) {
  const users = await User.find().sort({ createdAt: -1 }).limit(100).select("_id name email role createdAt").lean();
  res.json({ users });
}

async function listPendingEvents(_req, res) {
  const events = await Event.find({ status: "pending" }).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ events });
}

async function setEventStatus(req, res) {
  const { eventId } = req.params;
  const { status } = req.body; // approved | rejected
  if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid status" });

  const event = await Event.findByIdAndUpdate(eventId, { $set: { status } }, { new: true }).lean();
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json({ event });
}

async function deletePostAsAdmin(req, res) {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });
  await post.deleteOne();
  res.json({ ok: true });
}

async function makeUserAdmin(req, res) {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.role = "admin";
  await user.save();
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

async function removeUser(req, res) {
  const { userId } = req.params;
  if (userId === req.user._id.toString()) return res.status(400).json({ message: "You cannot remove yourself" });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  await Promise.all([
    Profile.deleteOne({ userId }),
    Connection.deleteMany({ $or: [{ fromUserId: userId }, { toUserId: userId }] }),
    Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] }),
    Notification.deleteMany({ userId }),
    Post.deleteMany({ userId }),
    Event.deleteMany({ createdBy: userId }),
    Event.updateMany({}, { $pull: { registrations: userId } }),
    User.deleteOne({ _id: userId }),
  ]);

  res.json({ ok: true });
}

module.exports = { listUsers, listPendingEvents, setEventStatus, deletePostAsAdmin, makeUserAdmin, removeUser };

