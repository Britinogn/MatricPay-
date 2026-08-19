"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignRoutes = void 0;
const express_1 = require("express");
const campaign_controller_1 = require("../controllers/campaign.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const async_handler_1 = require("../utils/async-handler");
exports.campaignRoutes = (0, express_1.Router)();
exports.campaignRoutes.get("/slug/:slug", (0, async_handler_1.asyncHandler)(campaign_controller_1.campaignController.getBySlug.bind(campaign_controller_1.campaignController)));
exports.campaignRoutes.use(auth_middleware_1.authMiddleware);
exports.campaignRoutes.post("/", (0, async_handler_1.asyncHandler)(campaign_controller_1.campaignController.create.bind(campaign_controller_1.campaignController)));
exports.campaignRoutes.get("/", (0, async_handler_1.asyncHandler)(campaign_controller_1.campaignController.list.bind(campaign_controller_1.campaignController)));
exports.campaignRoutes.get("/:id", (0, async_handler_1.asyncHandler)(campaign_controller_1.campaignController.getById.bind(campaign_controller_1.campaignController)));
exports.campaignRoutes.patch("/:id", (0, async_handler_1.asyncHandler)(campaign_controller_1.campaignController.update.bind(campaign_controller_1.campaignController)));
exports.campaignRoutes.patch("/:id/status", (0, async_handler_1.asyncHandler)(campaign_controller_1.campaignController.updateStatus.bind(campaign_controller_1.campaignController)));
exports.campaignRoutes.delete("/:id", (0, async_handler_1.asyncHandler)(campaign_controller_1.campaignController.remove.bind(campaign_controller_1.campaignController)));
exports.campaignRoutes.post("/bulk-delete", (0, async_handler_1.asyncHandler)(campaign_controller_1.campaignController.bulkDelete.bind(campaign_controller_1.campaignController)));
//# sourceMappingURL=campaign.routes.js.map