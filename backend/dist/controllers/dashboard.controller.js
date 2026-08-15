"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const http_error_1 = require("../utils/http-error");
class DashboardController {
    async getCampaignDashboard(request, response) {
        const { id } = request.params;
        const user = request.user;
        if (!user) {
            throw new http_error_1.HttpError(401, "Unauthorized");
        }
        if (!id || typeof id !== "string") {
            throw new http_error_1.HttpError(400, "Campaign ID is required");
        }
        const data = await dashboard_service_1.dashboardService.getCampaignDashboard(user, id);
        response.status(200).json({
            success: true,
            data,
        });
    }
}
exports.DashboardController = DashboardController;
exports.dashboardController = new DashboardController();
//# sourceMappingURL=dashboard.controller.js.map