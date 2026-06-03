import "dotenv/config";
import app from "./app";
import { prisma } from "./app/lib/prisma";

let connected = false;

// Initialize database connection once per cold start
const initDatabase = async () => {
  if (connected) return;
  try {
    await prisma.$connect();
    connected = true;
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

// Middleware to ensure database is connected
app.use(async (req, res, next) => {
  try {
    if (!connected) {
      await initDatabase();
    }
    next();
  } catch (error) {
    console.error("❌ Init error:", error);
    return res.status(503).json({
      success: false,
      message: "Service temporarily unavailable",
    });
  }
});

// Error handling for unhandled rejections
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

export default app;
