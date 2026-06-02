import "dotenv/config";
import app from "./app";
import { connectDatabase } from "./app/config/database";
import { seedSuperAdmin } from "./app/seeds/supper-admin.seed";

// Vercel serverless: initialize DB once per cold start (no app.listen)
let initialized = false;

const init = async () => {
  if (!initialized) {
    await connectDatabase();
    await seedSuperAdmin();
    initialized = true;
  }
};

init().catch((err) => console.error("Init failed:", err));

export default app;
