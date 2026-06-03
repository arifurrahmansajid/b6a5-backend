import "dotenv/config";
import app from "./app";
import { connectDatabase } from "./app/config/database";
import { seedSuperAdmin } from "./app/seeds/supper-admin.seed";

let initialized = false;
let initError: Error | null = null;

const init = async () => {
  if (initialized || initError) return;

  try {
    await connectDatabase();
    await seedSuperAdmin();
    initialized = true;
    console.log("✅ Database initialized successfully");
  } catch (error) {
    initError = error as Error;
    console.error("❌ Initialization failed:", error);
    throw error;
  }
};

// Initialize on first request
app.use(async (req, res, next) => {
  if (!initialized && !initError) {
    try {
      await init();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Service initialization failed",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      });
    }
  }

  if (initError && !initialized) {
    return res.status(503).json({
      success: false,
      message: "Service unavailable - database connection failed",
    });
  }

  next();
});

export default app;
