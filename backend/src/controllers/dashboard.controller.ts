import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { HttpError } from "../utils/http-error";
import { auditService } from "../services/audit.service";

export class DashboardController {
  async getCampaignDashboard(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    const user = request.user;

    if (!user) {
      throw new HttpError(401, "Unauthorized");
    }

    if (!id || typeof id !== "string") {
      throw new HttpError(400, "Campaign ID is required");
    }

    const data = await dashboardService.getCampaignDashboard(user, id);

    response.status(200).json({
      success: true,
      data,
    });
  }

  async getOrganizerOverview(request: Request, response: Response): Promise<void> {
    const user = request.user;

    if (!user) {
      throw new HttpError(401, "Unauthorized");
    }

    const data = await dashboardService.getOrganizerOverview(user);

    response.status(200).json({
      success: true,
      data,
    });
  }

  async getCollectionTimeseries(request: Request, response: Response): Promise<void> {
    const { id } = request.params;
    const user = request.user;

    if (!user) {
      throw new HttpError(401, "Unauthorized");
    }

    if (!id || typeof id !== "string") {
      throw new HttpError(400, "Campaign ID is required");
    }

    const data = await dashboardService.getCampaignCollectionTimeseries(user, id);

    response.status(200).json({
      success: true,
      data,
    });
  }

  async listAuditLogs(request: Request, response: Response): Promise<void> {
    const user = request.user;
    if (!user) {
      throw new HttpError(401, "Unauthorized");
    }

    const query: { page?: number; limit?: number } = {};

    if (request.query.page) query.page = Number(request.query.page);
    if (request.query.limit) query.limit = Number(request.query.limit);

    const data = await auditService.listForOrganizer(user.id, query);

    response.status(200).json({
      success: true,
      data,
    });
  }

}

export const dashboardController = new DashboardController();
