import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const dashboardRoutes = Router();

dashboardRoutes.get(
  "/overview",
  authMiddleware,
  asyncHandler(dashboardController.getOrganizerOverview.bind(dashboardController))
);

dashboardRoutes.get(
  "/:id/dashboard",
  authMiddleware,
  asyncHandler(dashboardController.getCampaignDashboard.bind(dashboardController))
);

dashboardRoutes.get(
  "/:id/dashboard/timeseries",
  authMiddleware,
  asyncHandler(dashboardController.getCollectionTimeseries.bind(dashboardController))
);

dashboardRoutes.get(
  "/audit-logs",
  authMiddleware,
  asyncHandler(dashboardController.listAuditLogs.bind(dashboardController))
);
