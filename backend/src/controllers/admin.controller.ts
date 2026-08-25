import type { Request, Response } from "express";
import { CampaignStatus, UserStatus } from "@prisma/client";
import { adminService } from "../services/admin.service";
import { HttpError } from "../utils/http-error";
import { auditService } from "../services/audit.service";

export class AdminController {
  async listOrganizers(request: Request, response: Response): Promise<void> {
    const queryOptions: {
      page?: number;
      limit?: number;
      search?: string;
      status?: UserStatus;
    } = {};

    if (request.query.page) queryOptions.page = Number(request.query.page);
    if (request.query.limit) queryOptions.limit = Number(request.query.limit);
    if (typeof request.query.search === "string" && request.query.search.trim()) {
      queryOptions.search = request.query.search.trim();
    }
    if (typeof request.query.status === "string" && request.query.status.trim()) {
      queryOptions.status = request.query.status.trim() as UserStatus;
    }

    const data = await adminService.listOrganizers(queryOptions);

    response.status(200).json({
      success: true,
      data,
    });
  }

  async updateOrganizerStatus(request: Request, response: Response): Promise<void> {
    const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
    const { status } = request.body;
    const admin = request.user;

    if (!admin) {
      throw new HttpError(401, "Unauthorized");
    }

    if (!id) {
      throw new HttpError(400, "Organizer ID is required");
    }

    if (!status || !Object.values(UserStatus).includes(status)) {
      throw new HttpError(400, "Valid status ('active' | 'suspended') is required");
    }

    const data = await adminService.updateOrganizerStatus(admin, id, status);

    response.status(200).json({
      success: true,
      message: `Organizer status updated to ${status}`,
      data,
    });
  }

  async listCampaigns(request: Request, response: Response): Promise<void> {
    const queryOptions: {
      page?: number;
      limit?: number;
      search?: string;
      status?: CampaignStatus;
    } = {};

    if (request.query.page) queryOptions.page = Number(request.query.page);
    if (request.query.limit) queryOptions.limit = Number(request.query.limit);
    if (typeof request.query.search === "string" && request.query.search.trim()) {
      queryOptions.search = request.query.search.trim();
    }
    if (typeof request.query.status === "string" && request.query.status.trim()) {
      queryOptions.status = request.query.status.trim() as CampaignStatus;
    }

    const data = await adminService.listCampaigns(queryOptions);

    response.status(200).json({
      success: true,
      data,
    });
  }

  async updateCampaignStatus(request: Request, response: Response): Promise<void> {
    const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
    const { status } = request.body;
    const admin = request.user;

    if (!admin) {
      throw new HttpError(401, "Unauthorized");
    }

    if (!id) {
      throw new HttpError(400, "Campaign ID is required");
    }

    if (!status || !Object.values(CampaignStatus).includes(status)) {
      throw new HttpError(400, "Valid status ('draft' | 'active' | 'closed') is required");
    }

    const data = await adminService.updateCampaignStatus(admin, id, status);

    response.status(200).json({
      success: true,
      message: `Campaign status updated to ${status}`,
      data,
    });
  }

  async getDashboard(request: Request, response: Response): Promise<void> {
    const data = await adminService.getAdminDashboard();

    response.status(200).json({
      success: true,
      data,
    });
  }

  async listAuditLogs(request: Request, response: Response): Promise<void> {
    const query: {
      page?: number;
      limit?: number;
      event?: string;
      search?: string;
    } = {};

    if (request.query.page) query.page = Number(request.query.page);
    if (request.query.limit) query.limit = Number(request.query.limit);
    if (typeof request.query.event === "string" && request.query.event.trim()) {
      query.event = request.query.event.trim();
    }
    if (typeof request.query.search === "string" && request.query.search.trim()) {
      query.search = request.query.search.trim();
    }

    const data = await auditService.listForAdmin(query);

    response.status(200).json({ success: true, data });
  }

  async listWebhookLogs(request: Request, response: Response): Promise<void> {
    const query: {
      page?: number;
      limit?: number;
      processed?: boolean;
      reference?: string;
    } = {};

    if (request.query.page) query.page = Number(request.query.page);
    if (request.query.limit) query.limit = Number(request.query.limit);
    if (request.query.processed === "true") query.processed = true;
    if (request.query.processed === "false") query.processed = false;
    if (
      typeof request.query.reference === "string" &&
      request.query.reference.trim()
    ) {
      query.reference = request.query.reference.trim();
    }

    const data = await auditService.listWebhooks(query);

    response.status(200).json({ success: true, data });
  }

  async getWebhookLog(request: Request, response: Response): Promise<void> {
    const id = Array.isArray(request.params.id)
      ? request.params.id[0]
      : request.params.id;

    if (!id) {
      throw new HttpError(400, "Webhook log ID is required");
    }

    const data = await auditService.getWebhookById(id);

    response.status(200).json({ success: true, data });
  }
}

export const adminController = new AdminController();
