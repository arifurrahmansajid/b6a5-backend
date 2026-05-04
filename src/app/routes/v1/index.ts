import { authRoutes } from "@/app/modules/auth/auth.route";
import { donationRoutes } from "@/app/modules/donation/donation.route";
import { messageRoutes } from "@/app/modules/message/message.route";
import { requestRoutes } from "@/app/modules/request/request.route";
import { responseRoutes } from "@/app/modules/response/response.route";
import { StatsRoutes } from "@/app/modules/stats/stats.routes";
import { userRoutes } from "@/app/modules/user/user.route";
import type { Routes } from "@/app/types";
import { Router } from "express";

const router: Router = Router();

const routes: Routes[] = [
  { path: "/auth", router: authRoutes },
  { path: "/users", router: userRoutes },
  { path: "/requests", router: requestRoutes },
  { path: "/responses", router: responseRoutes },
  { path: "/messages", router: messageRoutes },
  { path: "/donations", router: donationRoutes },
  { path: "/stats", router: StatsRoutes },
];

routes.forEach((route) => router.use(route.path, route.router));

export const v1Routes = router;
