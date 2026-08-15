"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.AdminController = void 0;
const client_1 = require("@prisma/client");
const admin_service_1 = require("../services/admin.service");
const http_error_1 = require("../utils/http-error");
class AdminController {
    async listOrganizers(request, response) {
        const queryOptions = {};
        if (request.query.page)
            queryOptions.page = Number(request.query.page);
        if (request.query.limit)
            queryOptions.limit = Number(request.query.limit);
        if (typeof request.query.search === "string" && request.query.search.trim()) {
            queryOptions.search = request.query.search.trim();
        }
        if (typeof request.query.status === "string" && request.query.status.trim()) {
            queryOptions.status = request.query.status.trim();
        }
        const data = await admin_service_1.adminService.listOrganizers(queryOptions);
        response.status(200).json({
            success: true,
            data,
        });
    }
    async updateOrganizerStatus(request, response) {
        const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        const { status } = request.body;
        const admin = request.user;
        if (!admin) {
            throw new http_error_1.HttpError(401, "Unauthorized");
        }
        if (!id) {
            throw new http_error_1.HttpError(400, "Organizer ID is required");
        }
        if (!status || !Object.values(client_1.UserStatus).includes(status)) {
            throw new http_error_1.HttpError(400, "Valid status ('active' | 'suspended') is required");
        }
        const data = await admin_service_1.adminService.updateOrganizerStatus(admin, id, status);
        response.status(200).json({
            success: true,
            message: `Organizer status updated to ${status}`,
            data,
        });
    }
    async listCampaigns(request, response) {
        const queryOptions = {};
        if (request.query.page)
            queryOptions.page = Number(request.query.page);
        if (request.query.limit)
            queryOptions.limit = Number(request.query.limit);
        if (typeof request.query.search === "string" && request.query.search.trim()) {
            queryOptions.search = request.query.search.trim();
        }
        if (typeof request.query.status === "string" && request.query.status.trim()) {
            queryOptions.status = request.query.status.trim();
        }
        const data = await admin_service_1.adminService.listCampaigns(queryOptions);
        response.status(200).json({
            success: true,
            data,
        });
    }
    async updateCampaignStatus(request, response) {
        const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        const { status } = request.body;
        const admin = request.user;
        if (!admin) {
            throw new http_error_1.HttpError(401, "Unauthorized");
        }
        if (!id) {
            throw new http_error_1.HttpError(400, "Campaign ID is required");
        }
        if (!status || !Object.values(client_1.CampaignStatus).includes(status)) {
            throw new http_error_1.HttpError(400, "Valid status ('draft' | 'active' | 'closed') is required");
        }
        const data = await admin_service_1.adminService.updateCampaignStatus(admin, id, status);
        response.status(200).json({
            success: true,
            message: `Campaign status updated to ${status}`,
            data,
        });
    }
    async getDashboard(request, response) {
        const data = await admin_service_1.adminService.getAdminDashboard();
        response.status(200).json({
            success: true,
            data,
        });
    }
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
//# sourceMappingURL=admin.controller.js.map