const dotenv = require("dotenv");
dotenv.config();

const { connectToDatabase } = require("../config/db");
const { User } = require("../models/User");
const { Profile } = require("../models/Profile");

const DEMO_USERS = [
  {
    name: "UniLink Admin",
    email: "admin.demo@unilink.com",
    password: "Admin@12345",
    role: "admin",
    profile: {
      department: "Administration",
      year: "N/A",
      bio: "Platform administrator account for demo and moderation.",
      skills: ["Moderation", "User Management", "Event Review"],
    },
  },
  {
    name: "Demo Student",
    email: "user.demo@unilink.com",
    password: "User@12345",
    role: "student",
    profile: {
      department: "Computer Science",
      year: "3rd Year",
      bio: "Demo student account used for exploring user features.",
      skills: ["React", "Node.js", "UI Design"],
    },
  },
];

async function upsertDemoUser(def) {
  const passwordHash = await User.hashPassword(def.password);
  const user = await User.findOneAndUpdate(
    { email: def.email.toLowerCase().trim() },
    {
      $set: {
        name: def.name,
        email: def.email.toLowerCase().trim(),
        passwordHash,
        role: def.role,
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  await Profile.findOneAndUpdate(
    { userId: user._id },
    { $set: { ...(def.profile || {}) } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  return user;
}

async function main() {
  await connectToDatabase(process.env.MONGODB_URI);

  for (const def of DEMO_USERS) {
    const user = await upsertDemoUser(def);
    // eslint-disable-next-line no-console
    console.log(`Ready: ${user.email} (${user.role})`);
  }

  // eslint-disable-next-line no-console
  console.log("Demo users seeded successfully.");
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
