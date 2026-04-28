const http = require("http");
const dotenv = require("dotenv");

dotenv.config();

const { createApp } = require("./app");
const { connectToDatabase } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function main() {
  await connectToDatabase(process.env.MONGODB_URI);
  const app = createApp();
  const server = http.createServer(app);

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`UniLink API listening on port ${PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});