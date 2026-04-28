const mongoose = require("mongoose");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectToDatabase(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  const maxAttempts = Number(process.env.DB_CONNECT_RETRIES || 3);
  const retryDelayMs = Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 2000);

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      // eslint-disable-next-line no-console
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      lastError = error;
      // eslint-disable-next-line no-console
      console.error(`DB connection attempt ${attempt}/${maxAttempts} failed:`, error.message);

      if (attempt < maxAttempts) {
        await wait(retryDelayMs);
      }
    }
  }

  if (lastError?.message?.includes("tlsv1 alert internal error")) {
    // eslint-disable-next-line no-console
    console.error(
      "MongoDB TLS handshake failed. Check Atlas Network Access allowlist, cluster status, and the connection string."
    );
  }

  throw lastError || new Error("Database connection failed");
}

module.exports = { connectToDatabase };