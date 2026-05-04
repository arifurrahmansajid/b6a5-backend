import type { EnvConfig } from "../types";
import { envParse } from "../utils/env-parse.util";

const { getEnv, parseIntEnv, requireEnv, parseBoolEnv } = envParse;

export function loadConfig(): EnvConfig {
  return {
    appName: getEnv("APP_NAME", "MyApp"),
    nodeEnv: getEnv("NODE_ENV", "development"),
    port: parseIntEnv("PORT", 5000),

    databaseUrl: requireEnv("DATABASE_URL"),

    cookieSecret: getEnv("COOKIE_SECRET", "default_cookie_secret"),

    corsOrigins: getEnv("CORS_ORIGINS", "*")
      .split(",")
      .map((o) => o.trim()),

    jwt: {
      accessToken: {
        secret: getEnv("JWT_ACCESS_SECRET", "default_access_secret"),
        expiresIn: getEnv("JWT_ACCESS_EXPIRES_IN", "7d"),
      },
      refreshToken: {
        secret: getEnv("JWT_REFRESH_SECRET", "default_refresh_secret"),
        expiresIn: getEnv("JWT_REFRESH_EXPIRES_IN", "30d"),
      },
    },

    betterAuth: {
      secret: getEnv("BETTER_AUTH_SECRET", "better_auth_secret"),
      baseURL: getEnv("BETTER_AUTH_URL", "http://localhost:5000"),
      basePath: getEnv("BETTER_AUTH_PATH", "/api/auth/v1"),
      cookiePrefix: getEnv("BETTER_AUTH_COOKIE_PREFIX", "ba"),
      sessionToken: {
        expiresIn: getEnv("BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN", "7d"),
        updateAge: getEnv("BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE", "1d"),
        cookieCacheAge: getEnv("BETTER_AUTH_SESSION_TOKEN_COOKIE_CACHE_AGE", "300"),
      },
    },

    email: {
      smtp: {
        host: requireEnv("EMAIL_SENDER_SMTP_HOST"),
        port: parseIntEnv("EMAIL_SENDER_SMTP_PORT", 465),
        user: requireEnv("EMAIL_SENDER_SMTP_USER"),
        pass: requireEnv("EMAIL_SENDER_SMTP_PASS"),
        secure: parseBoolEnv("EMAIL_SENDER_SMTP_SECURE", true),
      },

      from: getEnv("EMAIL_FROM", "no-reply@yourapp.com"),
    },
    superAdmin: {
      email: requireEnv("SUPER_ADMIN_EMAIL"),
      password: requireEnv("SUPER_ADMIN_PASSWORD"),
    },

    stripe: {
      secretKey: requireEnv("STRIPE_SECRET_KEY"),
      publishableKey: requireEnv("STRIPE_PUBLISHABLE_KEY"),
      webhookSecret: requireEnv("STRIPE_WEBHOOK_SECRET"),
    },
  };
}

// -----------------------------
// Singleton
// -----------------------------
let _config: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (!_config) {
    _config = loadConfig();

    if (_config.nodeEnv === "production") {
      Object.freeze(_config);
    }
  }

  return _config;
}
