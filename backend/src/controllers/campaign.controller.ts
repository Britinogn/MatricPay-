import type { Request, Response } from "express";
import { HttpError } from "../utils/http-error";
import { campaignService } from "../services/campaign.service";
import {
  CampaignIdParamSchema,
  CampaignListQuerySchema,
  CampaignSlugParamSchema,
  CreateCampaignSchema,
  UpdateCampaignSchema,
  UpdateCampaignStatusSchema,
  BulkDeleteCampaignsSchema,
  CampaignPaymentsQuerySchema,
} from "../validators/campaign.validator";

function requireAuthenticatedUser(request: Request) {
  if (!request.user) {
    throw new HttpError(401, "Unauthorized");
  }

  return request.user;
}

export class CampaignController {
  async create(request: Request, response: Response): Promise<void> {
    const user = requireAuthenticatedUser(request);
    const data = CreateCampaignSchema.parse(request.body);
    const result = await campaignService.createCampaign(user, data);

    response.status(201).json(result);
  }

  async list(request: Request, response: Response): Promise<void> {
    const user = requireAuthenticatedUser(request);
    const query = CampaignListQuerySchema.parse(request.query);
    const result = await campaignService.listCampaigns(user, query);

    response.status(200).json(result);
  }

  async getById(request: Request, response: Response): Promise<void> {
    const user = requireAuthenticatedUser(request);
    const { id } = CampaignIdParamSchema.parse(request.params);
    const result = await campaignService.getCampaign(user, id);

    response.status(200).json(result);
  }

  async update(request: Request, response: Response): Promise<void> {
    const user = requireAuthenticatedUser(request);
    const { id } = CampaignIdParamSchema.parse(request.params);
    const data = UpdateCampaignSchema.parse(request.body);
    const result = await campaignService.updateCampaign(user, id, data);

    response.status(200).json(result);
  }

  async updateStatus(request: Request, response: Response): Promise<void> {
    const user = requireAuthenticatedUser(request);
    const { id } = CampaignIdParamSchema.parse(request.params);
    const data = UpdateCampaignStatusSchema.parse(request.body);
    const result = await campaignService.updateCampaignStatus(user, id, data);

    response.status(200).json(result);
  }

  async getBySlug(request: Request, response: Response): Promise<void> {
    const { slug } = CampaignSlugParamSchema.parse(request.params);
    const result = await campaignService.getPublicCampaignBySlug(slug);

    response.status(200).json(result);
  }

  async remove(request: Request, response: Response): Promise<void> {
    const id =
      typeof request.params.id === "string"
        ? request.params.id
        : request.params.id[0];

    if (!id) {
      throw new HttpError(400, "Campaign id is required");
    }

    await campaignService.deleteCampaign(request.user!, id);

    response.status(200).json({
      success: true,
      message: "Campaign deleted",
    });
  }

  async bulkDelete(request: Request, response: Response): Promise<void> {
    const user = requireAuthenticatedUser(request);
    const { campaignIds } = BulkDeleteCampaignsSchema.parse(request.body);
    const result = await campaignService.bulkDeleteCampaigns(user, campaignIds);

    response.status(200).json(result);
  }

  async listPayments(request: Request, response: Response): Promise<void> {
    const user = requireAuthenticatedUser(request);
    const { id } = CampaignIdParamSchema.parse(request.params);
    const query = CampaignPaymentsQuerySchema.parse(request.query);
  
    const result = await campaignService.listCampaignPayments(
      user,
      id,
      query
    );
  
    response.status(200).json(result);
  }

}

export const campaignController = new CampaignController();
