const { Connection } = require("../models/Connection");
const { Message } = require("../models/Message");
const { User } = require("../models/User");

async function ensureConnected(userId, otherUserId) {
  const conn = await Connection.findOne({
    status: "accepted",
    $or: [
      { fromUserId: userId, toUserId: otherUserId },
      { fromUserId: otherUserId, toUserId: userId },
    ],
  }).lean();
  return Boolean(conn);
}

async function listMessages(req, res) {
  const me = req.user._id;
  const otherUserId = req.params.userId;

  const otherUser = await User.findById(otherUserId).select("_id name email").lean();
  if (!otherUser) return res.status(404).json({ message: "User not found" });

  const connected = await ensureConnected(me, otherUserId);
  if (!connected) return res.status(403).json({ message: "You can only chat with connected students" });

  const messages = await Message.find({
    $or: [
      { senderId: me, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: me },
    ],
  })
    .sort({ createdAt: 1 })
    .limit(300)
    .lean();

  await Message.updateMany({ senderId: otherUserId, receiverId: me, readAt: null }, { $set: { readAt: new Date() } });

  res.json({ otherUser, messages });
}

async function sendMessage(req, res) {
  const me = req.user._id;
  const otherUserId = req.params.userId;
  const text = (req.body.text || "").toString().trim();
  if (!text) return res.status(400).json({ message: "Message text is required" });

  const otherUser = await User.findById(otherUserId).select("_id");
  if (!otherUser) return res.status(404).json({ message: "User not found" });

  const connected = await ensureConnected(me, otherUserId);
  if (!connected) return res.status(403).json({ message: "You can only chat with connected students" });

  const message = await Message.create({
    senderId: me,
    receiverId: otherUserId,
    text,
  });

  res.status(201).json({ message });
}

module.exports = { listMessages, sendMessage };
