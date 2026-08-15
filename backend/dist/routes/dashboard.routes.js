"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = void 0;
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const async_handler_1 = require("../utils/async-handler");
exports.dashboardRoutes = (0, express_1.Router)();
exports.dashboardRoutes.use(auth_middleware_1.authMiddleware);
exports.dashboardRoutes.get("/:id/dashboard", (0, async_handler_1.asyncHandler)(dashboard_controller_1.dashboardController.getCampaignDashboard.bind(dashboard_controller_1.dashboardController)));
//# sourceMappingURL=dashboard.routes.js.map