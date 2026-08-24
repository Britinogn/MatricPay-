import { Router } from "express";
import { campaignController } from "../controllers/campaign.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const campaignRoutes = Router();

campaignRoutes.get(
  "/slug/:slug",
  asyncHandler(campaignController.getBySlug.bind(campaignController))
);

campaignRoutes.use(authMiddleware);

campaignRoutes.post("/", asyncHandler(campaignController.create.bind(campaignController)));
campaignRoutes.get("/", asyncHandler(campaignController.list.bind(campaignController)));
campaignRoutes.get("/:id", asyncHandler(campaignController.getById.bind(campaignController)));

campaignRoutes.get(
  "/:id/payments",
  asyncHandler(campaignController.listPayments.bind(campaignController))
);

campaignRoutes.patch("/:id", asyncHandler(campaignController.update.bind(campaignController)));
campaignRoutes.patch(
  "/:id/status",
  asyncHandler(campaignController.updateStatus.bind(campaignController))
);

campaignRoutes.delete(
  "/:id",
  asyncHandler(campaignController.remove.bind(campaignController))
);

campaignRoutes.post(
  "/bulk-delete",
  asyncHandler(campaignController.bulkDelete.bind(campaignController))
);