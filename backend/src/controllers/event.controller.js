const { validationResult } = require("express-validator");
const { Event } = require("../models/Event");
const { Notification } = require("../models/Notification");

async function listEvents(req, res) {
  const status = req.user.role === "admin" ? (req.query.status || "approved") : "approved";
  const events = await Event.find({ status })
    .sort({ date: 1 })
    .limit(50)
    .populate("createdBy", "name")
    .lean();
  res.json({ events });
}

async function createEvent(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid input", errors: errors.array() });

  const { eventName, date, location, description } = req.body;
  const status = req.user.role === "admin" ? "approved" : "pending";
  const event = await Event.create({
    eventName,
    date: new Date(date),
    location,
    description,
    createdBy: req.user._id,
    status,
  });
  const populated = await Event.findById(event._id).populate("createdBy", "name").lean();
  res.status(201).json({ event: populated });
}

async function registerForEvent(req, res) {
  const event = await Event.findById(req.params.eventId);
  if (!event) return res.status(404).json({ message: "Event not found" });
  if (event.status !== "approved") return res.status(400).json({ message: "Event is not open for registration" });

  const userIdStr = req.user._id.toString();
  const idx = event.registrations.findIndex((id) => id.toString() === userIdStr);
  const registered = idx === -1;
  if (registered) event.registrations.push(req.user._id);
  else event.registrations.splice(idx, 1);
  await event.save();

  if (registered) {
    await Notification.create({
      userId: req.user._id,
      type: "event_registered",
      message: `You registered for ${event.eventName}`,
      link: `/events/${event._id}`,
    });
  }

  res.json({ registered, registrations: event.registrations.length });
}

module.exports = { listEvents, createEvent, registerForEvent };

