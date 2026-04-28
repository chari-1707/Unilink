const { Connection } = require("../models/Connection");
const { Message } = require("../models/Message");
const { Notification } = require("../models/Notification");
const { User } = require("../models/User");

async function sendRequest(req, res) {
  const toUserId = req.params.userId;
  if (toUserId === req.user._id.toString()) return res.status(400).json({ message: "Cannot connect to yourself" });

  const toUser = await User.findById(toUserId).select("_id name");
  if (!toUser) return res.status(404).json({ message: "User not found" });

  const existing = await Connection.findOne({ fromUserId: req.user._id, toUserId });
  if (existing && existing.status === "pending") return res.status(409).json({ message: "Request already pending" });
  if (existing && existing.status === "accepted") return res.status(409).json({ message: "Already connected" });

  const conn = await Connection.findOneAndUpdate(
    { fromUserId: req.user._id, toUserId },
    { $set: { status: "pending" } },
    { upsert: true, new: true }
  );

  await Notification.create({
    userId: toUserId,
    type: "connection_request",
    message: `${req.user.name} sent you a connection request`,
    link: `/students/${req.user._id}`,
  });

  res.status(201).json({ connection: conn });
}

async function respondToRequest(req, res) {
  const { requestId } = req.params;
  const { action } = req.body; // accept | reject
  if (!["accept", "reject"].includes(action)) return res.status(400).json({ message: "Invalid action" });

  const conn = await Connection.findById(requestId);
  if (!conn) return res.status(404).json({ message: "Request not found" });
  if (conn.toUserId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });
  if (conn.status !== "pending") return res.status(400).json({ message: "Request already handled" });

  conn.status = action === "accept" ? "accepted" : "rejected";
  await conn.save();

  if (conn.status === "accepted") {
    // create reverse connection for easy querying
    await Connection.findOneAndUpdate(
      { fromUserId: conn.toUserId, toUserId: conn.fromUserId },
      { $set: { status: "accepted" } },
      { upsert: true, new: true }
    );

    await Notification.create({
      userId: conn.fromUserId,
      type: "connection_accepted",
      message: `${req.user.name} accepted your connection request`,
      link: `/students/${req.user._id}`,
    });
  }

  res.json({ connection: conn });
}

async function listMyConnections(req, res) {
  const accepted = await Connection.find({ fromUserId: req.user._id, status: "accepted" })
    .sort({ updatedAt: -1 })
    .populate("toUserId", "name email")
    .lean();

  const enriched = await Promise.all(
    accepted.map(async (c) => {
      const partnerId = c.toUserId?._id;
      if (!partnerId) return { ...c, unreadCount: 0, lastMessageText: "" };

      const [unreadCount, lastMessage] = await Promise.all([
        Message.countDocuments({ senderId: partnerId, receiverId: req.user._id, readAt: null }),
        Message.findOne({
          $or: [
            { senderId: req.user._id, receiverId: partnerId },
            { senderId: partnerId, receiverId: req.user._id },
          ],
        })
          .sort({ createdAt: -1 })
          .lean(),
      ]);

      return {
        ...c,
        unreadCount,
        lastMessageText: lastMessage?.text || "",
        lastMessageAt: lastMessage?.createdAt || null,
      };
    })
  );

  res.json({ connections: enriched });
}

async function listIncomingRequests(req, res) {
  const requests = await Connection.find({ toUserId: req.user._id, status: "pending" })
    .sort({ createdAt: -1 })
    .populate("fromUserId", "name email")
    .lean();
  res.json({ requests });
}

module.exports = { sendRequest, respondToRequest, listMyConnections, listIncomingRequests };

