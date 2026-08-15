import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const dashboardRoutes = Router();

dashboardRoutes.use(authMiddleware);

dashboardRoutes.get(
  "/overview",
  asyncHandler(dashboardController.getOrganizerOverview.bind(dashboardController))
);

dashboardRoutes.get(
  "/:id/dashboard",
  asyncHandler(dashboardController.getCampaignDashboard.bind(dashboardController))
);
