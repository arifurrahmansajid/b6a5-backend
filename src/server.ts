import "dotenv/config";
import app from "./app";
import { connectDatabase, disconnectDatabase } from "./app/config";
import { getConfig } from "./app/config/env";
import { seedSuperAdmin } from "./app/seeds/supper-admin.seed";

async function bootstrap(): Promise<void> {
  const config = getConfig();

  // Connect databases
  await connectDatabase();

  await seedSuperAdmin();

  // Start HTTP server
  const server = app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });

  // Graceful Shutdown  ─
  const shutdown = async (signal: string) => {
    console.info(`Received ${signal} — starting graceful shutdown`);

    server.close(async () => {
      await disconnectDatabase();
      console.info("Graceful shutdown complete");
      process.exit(0);
    });

    // Force exit if shutdown takes too long
    setTimeout(() => {
      process.exit(1);
    }, 30000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Unhandled error safety nets ─────────────────────────────────────────
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Promise rejection", { reason });
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught exception", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  console.error("Bootstrap failed:", error);
  process.exit(1);
});
