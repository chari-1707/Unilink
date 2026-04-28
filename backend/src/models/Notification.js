const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["connection_request", "connection_accepted", "event_registered", "event_started", "post_liked", "post_commented"],
      required: true,
    },
    message: { type: String, required: true, trim: true, maxlength: 240 },
    link: { type: String, trim: true, maxlength: 300 },
    readAt: { type: Date },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };

