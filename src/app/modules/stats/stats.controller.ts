import type { Request, Response } from "express";
import status from "http-status";
import { asyncHandler } from "../../utils/async-handler.util";
import { sendResponse } from "../../utils/send-response.util";
import { StatsService } from "./stats.service";

const getDashboardStatsData = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await StatsService.getDashboardStatsData(user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Stats data retrieved successfully!",
    data: result,
  });
});

export const StatsController = {
  getDashboardStatsData,
};
