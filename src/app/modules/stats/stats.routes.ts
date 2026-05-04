import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth-middleware";
import { StatsController } from "./stats.controller";

const router: Router = Router();

router.get(
  "/",
  auth([Role.SUPER_ADMIN, Role.ADMIN, Role.USER]),
  StatsController.getDashboardStatsData,
);

export const StatsRoutes = router;
