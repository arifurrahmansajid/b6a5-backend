import status from "http-status";
import AppError from "./app-error.util";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      `Missing required environment variable: ${key}`,
    );
  }
  return value;
}

function getEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function parseIntEnv(key: string, fallback: number): number {
  const val = process.env[key];
  if (!val) return fallback;

  const parsed = parseInt(val, 10);
  if (isNaN(parsed)) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, `${key} must be a valid integer`);
  }

  return parsed;
}

function parseBoolEnv(key: string, fallback: boolean): boolean {
  const val = process.env[key];
  if (val === undefined) return fallback;

  return ["true", "1", "yes"].includes(val.toLowerCase());
}

export const envParse = {
  requireEnv,
  getEnv,
  parseIntEnv,
  parseBoolEnv,
};
