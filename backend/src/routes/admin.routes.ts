import { Router } from "express";
import { UserRole } from "@prisma/client";
import { adminController } from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/async-handler";

export const adminRoutes = Router();

adminRoutes.use(authMiddleware);
adminRoutes.use(requireRole([UserRole.admin]));

adminRoutes.get(
  "/organizers",
  asyncHandler(adminController.listOrganizers.bind(adminController))
);

adminRoutes.patch(
  "/organizers/:id/status",
  asyncHandler(adminController.updateOrganizerStatus.bind(adminController))
);

adminRoutes.get(
  "/campaigns",
  asyncHandler(adminController.listCampaigns.bind(adminController))
);

adminRoutes.patch(
  "/campaigns/:id/status",
  asyncHandler(adminController.updateCampaignStatus.bind(adminController))
);

adminRoutes.get(
  "/dashboard",
  asyncHandler(adminController.getDashboard.bind(adminController))
);
