import type { CorsOptions } from "cors";
import status from "http-status";
import AppError from "../utils/app-error.util";
import { getConfig } from "./env";

const config = getConfig();

export const allowedHeaders = [
  "Accept",
  "Accept-Language",
  "Content-Language",
  "Content-Type",
  "Authorization",
  "X-Requested-With",
  "Origin",
  "Referer",
  "User-Agent",
];

export const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

const corsOptions: CorsOptions = {
  allowedHeaders,
  credentials: true,
  methods: allowedMethods,
  origin: (origin, callback) => {
    if (!origin || config.corsOrigins.includes(origin) || config.corsOrigins.includes("*")) {
      callback(null, true);
    } else {
      callback(new AppError(status.INTERNAL_SERVER_ERROR, `CORS: ${origin} not allowed`));
    }
  },
};

export default corsOptions;
