import cookieParser from "cookie-parser";
import cors from "cors";
import type { Application, Response } from "express";
import express from "express";
import { getConfig } from "./app/config";
import corsOptions from "./app/config/cors";
import { globalError } from "./app/middlewares/global-error.middleware";
import { notFound } from "./app/middlewares/not-found.middleware";
import { paymentRoutes } from "./app/modules/payment/payment.route";
import { apiRouter } from "./app/routes";

const app: Application = express();
const config = getConfig();

app.use(cors(corsOptions));
app.use("/api/v1/payments/stripe", paymentRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.cookieSecret));
app.get("/", (_, res: Response) => {
  res.send(`Welcome to the ${config.appName}`);
});
app.use("/api", apiRouter);
app.use(notFound);
app.use(globalError);

export default app;
