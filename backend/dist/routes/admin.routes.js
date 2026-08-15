"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const async_handler_1 = require("../utils/async-handler");
exports.adminRoutes = (0, express_1.Router)();
exports.adminRoutes.use(auth_middleware_1.authMiddleware);
exports.adminRoutes.use((0, role_middleware_1.requireRole)([client_1.UserRole.admin]));
exports.adminRoutes.get("/organizers", (0, async_handler_1.asyncHandler)(admin_controller_1.adminController.listOrganizers.bind(admin_controller_1.adminController)));
exports.adminRoutes.patch("/organizers/:id/status", (0, async_handler_1.asyncHandler)(admin_controller_1.adminController.updateOrganizerStatus.bind(admin_controller_1.adminController)));
exports.adminRoutes.get("/campaigns", (0, async_handler_1.asyncHandler)(admin_controller_1.adminController.listCampaigns.bind(admin_controller_1.adminController)));
exports.adminRoutes.patch("/campaigns/:id/status", (0, async_handler_1.asyncHandler)(admin_controller_1.adminController.updateCampaignStatus.bind(admin_controller_1.adminController)));
exports.adminRoutes.get("/dashboard", (0, async_handler_1.asyncHandler)(admin_controller_1.adminController.getDashboard.bind(admin_controller_1.adminController)));
//# sourceMappingURL=admin.routes.js.map