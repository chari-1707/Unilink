const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    department: { type: String, trim: true, maxlength: 120 },
    year: { type: String, trim: true, maxlength: 40 },
    bio: { type: String, trim: true, maxlength: 500 },
    skills: [{ type: String, trim: true, maxlength: 60 }],
    interests: [{ type: String, trim: true, maxlength: 60 }],
    achievements: [{ type: String, trim: true, maxlength: 140 }],
    certifications: [{ type: String, trim: true, maxlength: 140 }],
    contact: {
      phone: { type: String, trim: true, maxlength: 30 },
      linkedin: { type: String, trim: true, maxlength: 200 },
      x: { type: String, trim: true, maxlength: 200 },
    },
    avatarUrl: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

const Profile = mongoose.model("Profile", profileSchema);

module.exports = { Profile };

