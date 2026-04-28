const { Notification } = require("../models/Notification");
const { Event } = require("../models/Event");

async function createEventStartNotificationsForUser(userId) {
  const now = new Date();
  const startedEvents = await Event.find({
    status: "approved",
    registrations: userId,
    date: { $lte: now },
  })
    .select("_id eventName")
    .lean();

  if (!startedEvents.length) return;

  const existing = await Notification.find({
    userId,
    type: "event_started",
    link: { $in: startedEvents.map((event) => `/events/${event._id}`) },
  })
    .select("link")
    .lean();

  const existingLinks = new Set(existing.map((n) => n.link));
  const toInsert = startedEvents
    .filter((event) => !existingLinks.has(`/events/${event._id}`))
    .map((event) => ({
      userId,
      type: "event_started",
      message: `${event.eventName} is starting now`,
      link: `/events/${event._id}`,
    }));

  if (toInsert.length) {
    await Notification.insertMany(toInsert);
  }
}

async function listMyNotifications(req, res) {
  await createEventStartNotificationsForUser(req.user._id);
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  const unreadCount = notifications.filter((n) => !n.readAt).length;
  res.json({ notifications, unreadCount });
}

async function markRead(req, res) {
  const { notificationId } = req.params;
  const n = await Notification.findOneAndUpdate(
    { _id: notificationId, userId: req.user._id },
    { $set: { readAt: new Date() } },
    { new: true }
  ).lean();
  if (!n) return res.status(404).json({ message: "Notification not found" });
  res.json({ notification: n });
}

async function markAllRead(req, res) {
  await Notification.updateMany(
    { userId: req.user._id, readAt: null },
    { $set: { readAt: new Date() } }
  );
  res.json({ ok: true });
}

module.exports = { listMyNotifications, markRead, markAllRead };

