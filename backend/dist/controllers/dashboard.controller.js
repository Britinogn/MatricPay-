"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const http_error_1 = require("../utils/http-error");
const audit_service_1 = require("../services/audit.service");
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
    async getOrganizerOverview(request, response) {
        const user = request.user;
        if (!user) {
            throw new http_error_1.HttpError(401, "Unauthorized");
        }
        const data = await dashboard_service_1.dashboardService.getOrganizerOverview(user);
        response.status(200).json({
            success: true,
            data,
        });
    }
    async getCollectionTimeseries(request, response) {
        const { id } = request.params;
        const user = request.user;
        if (!user) {
            throw new http_error_1.HttpError(401, "Unauthorized");
        }
        if (!id || typeof id !== "string") {
            throw new http_error_1.HttpError(400, "Campaign ID is required");
        }
        const data = await dashboard_service_1.dashboardService.getCampaignCollectionTimeseries(user, id);
        response.status(200).json({
            success: true,
            data,
        });
    }
    async listAuditLogs(request, response) {
        const user = request.user;
        if (!user) {
            throw new http_error_1.HttpError(401, "Unauthorized");
        }
        const query = {};
        if (request.query.page)
            query.page = Number(request.query.page);
        if (request.query.limit)
            query.limit = Number(request.query.limit);
        const data = await audit_service_1.auditService.listForOrganizer(user.id, query);
        response.status(200).json({
            success: true,
            data,
        });
    }
}
exports.DashboardController = DashboardController;
exports.dashboardController = new DashboardController();
//# sourceMappingURL=dashboard.controller.js.map