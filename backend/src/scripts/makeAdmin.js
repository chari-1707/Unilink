const dotenv = require("dotenv");
dotenv.config();

const { connectToDatabase } = require("../config/db");
const { User } = require("../models/User");

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.log("Usage: node src/scripts/makeAdmin.js <email>");
    process.exit(1);
  }

  await connectToDatabase(process.env.MONGODB_URI);

  const user = await User.findOneAndUpdate({ email: email.toLowerCase().trim() }, { $set: { role: "admin" } }, { new: true });
  if (!user) {
    console.log("User not found for email:", email);
    process.exit(1);
  }

  console.log("Updated user to admin:", { id: user._id.toString(), email: user.email, role: user.role });
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});