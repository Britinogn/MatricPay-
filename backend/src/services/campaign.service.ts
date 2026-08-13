import { Campaign, CampaignStatus, CampaignType, Prisma, UserRole } from "@prisma/client";
import { env } from "../config/env";
import { campaignRepository } from "../repositories/campaign.repository";
import { HttpError } from "../utils/http-error";
import { generateCampaignSlug } from "../utils/slug";
import type {
  CampaignListQueryInput,
  CreateCampaignInput,
  UpdateCampaignInput,
  UpdateCampaignStatusInput,
} from "../validators/campaign.validator";

type AuthUser = {
  id: string;
  role: UserRole;
};

const MAX_SLUG_ATTEMPTS = 5;

function toCampaignResponse(campaign: Campaign) {
  const isExpired =
    campaign.status === CampaignStatus.active &&
    campaign.expiresAt !== null &&
    campaign.expiresAt.getTime() < Date.now();

  return {
    ...campaign,
    isExpired,
  };
}

function toDateOrNull(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return new Date(value);
}

function validateCampaignTypeRules(campaignType: CampaignType, amountType: "fixed" | "minimum") {
  if (campaignType === CampaignType.restricted && amountType !== "fixed") {
    throw new HttpError(400, "Restricted campaigns must use a fixed amount");
  }
}

export class CampaignService {
  private async generateUniqueSlug(title: string): Promise<string> {
    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
      const slug = generateCampaignSlug(title);
      const exists = await campaignRepository.slugExists(slug);

      if (!exists) {
        return slug;
      }
    }

    throw new HttpError(500, "Could not generate a unique campaign slug");
  }

  async createCampaign(user: AuthUser, data: CreateCampaignInput) {
    validateCampaignTypeRules(data.campaignType, data.amountType);

    const slug = await this.generateUniqueSlug(data.title);
    const paymentLink = `${env.CLIENT_URL}/pay/${slug}`;
    const expiresAt = toDateOrNull(data.expiresAt);

    const createData: Prisma.CampaignUncheckedCreateInput = {
      organizerId: user.id,
      organizationId: data.organizationId ?? null,
      title: data.title,
      description: data.description ?? null,
      amount: data.amount,
      amountType: data.amountType,
      currency: data.currency,
      slug,
      paymentLink,
      campaignType: data.campaignType,
      status: CampaignStatus.draft,
    };

    if (expiresAt !== undefined) {
      createData.expiresAt = expiresAt;
    }

    const campaign = await campaignRepository.create(createData);

    return { campaign: toCampaignResponse(campaign) };
  }

  async listCampaigns(user: AuthUser, query: CampaignListQueryInput) {
    const result = await campaignRepository.listByOrganizer({
      organizerId: user.id,
      ...(query.status ? { status: query.status } : {}),
      ...(query.campaignType ? { campaignType: query.campaignType } : {}),
      ...(query.search ? { search: query.search } : {}),
      page: query.page,
      limit: query.limit,
    });

    return {
      ...result,
      campaigns: result.campaigns.map(toCampaignResponse),
    };
  }

  async getCampaign(user: AuthUser, campaignId: string) {
    const campaign = await this.getOwnedCampaign(user, campaignId);
    return { campaign: toCampaignResponse(campaign) };
  }

  async updateCampaign(user: AuthUser, campaignId: string, data: UpdateCampaignInput) {
    const campaign = await this.getOwnedCampaign(user, campaignId);

    if (campaign.status !== CampaignStatus.draft) {
      throw new HttpError(400, "Only draft campaigns can be updated");
    }

    const nextCampaignType = data.campaignType ?? campaign.campaignType;
    const nextAmountType = data.amountType ?? campaign.amountType;
    validateCampaignTypeRules(nextCampaignType, nextAmountType);

    const updateData: Prisma.CampaignUncheckedUpdateInput = {};

    if (data.organizationId !== undefined) {
      updateData.organizationId = data.organizationId;
    }

    if (data.title !== undefined) {
      updateData.title = data.title;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.amount !== undefined) {
      updateData.amount = data.amount;
    }

    if (data.amountType !== undefined) {
      updateData.amountType = data.amountType;
    }

    if (data.currency !== undefined) {
      updateData.currency = data.currency;
    }

    if (data.campaignType !== undefined) {
      updateData.campaignType = data.campaignType;
    }

    const expiresAt = toDateOrNull(data.expiresAt);
    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt;
    }

    const updatedCampaign = await campaignRepository.update(campaign.id, updateData);

    return { campaign: toCampaignResponse(updatedCampaign) };
  }

  async updateCampaignStatus(
    user: AuthUser,
    campaignId: string,
    data: UpdateCampaignStatusInput
  ) {
    if (data.status === CampaignStatus.active) {
      return this.activateCampaign(user, campaignId);
    }

    return this.closeCampaign(user, campaignId);
  }

  async getPublicCampaignBySlug(slug: string) {
    const campaign = await campaignRepository.findBySlug(slug);

    if (!campaign) {
      throw new HttpError(404, "Campaign not found");
    }

    return {
      campaign: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        amount: campaign.amount,
        amountType: campaign.amountType,
        currency: campaign.currency,
        slug: campaign.slug,
        paymentLink: campaign.paymentLink,
        campaignType: campaign.campaignType,
        status: campaign.status,
        expiresAt: campaign.expiresAt,
        isExpired:
          campaign.status === CampaignStatus.active &&
          campaign.expiresAt !== null &&
          campaign.expiresAt.getTime() < Date.now(),
      },
    };
  }

  private async activateCampaign(user: AuthUser, campaignId: string) {
    const campaign = await this.getOwnedCampaign(user, campaignId);

    if (campaign.status !== CampaignStatus.draft) {
      throw new HttpError(400, "Only draft campaigns can be activated");
    }

    if (campaign.expiresAt && campaign.expiresAt.getTime() < Date.now()) {
      throw new HttpError(400, "Expired campaigns cannot be activated");
    }

    if (campaign.campaignType === CampaignType.restricted) {
      const studentCount = await campaignRepository.countStudents(campaign.id);
      const completedImportCount = await campaignRepository.countCompletedStudentImports(campaign.id);

      if (studentCount === 0 && completedImportCount === 0) {
        throw new HttpError(400, "Restricted campaigns require students before activation");
      }
    }

    const updatedCampaign = await campaignRepository.update(campaign.id, {
      status: CampaignStatus.active,
    });

    return { campaign: toCampaignResponse(updatedCampaign) };
  }

  private async closeCampaign(user: AuthUser, campaignId: string) {
    const campaign = await this.getOwnedCampaign(user, campaignId);

    if (campaign.status !== CampaignStatus.active) {
      throw new HttpError(400, "Only active campaigns can be closed");
    }

    const updatedCampaign = await campaignRepository.update(campaign.id, {
      status: CampaignStatus.closed,
    });

    return { campaign: toCampaignResponse(updatedCampaign) };
  }

  private async getOwnedCampaign(user: AuthUser, campaignId: string) {
    const campaign =
      user.role === UserRole.admin
        ? await campaignRepository.findById(campaignId)
        : await campaignRepository.findByIdForOrganizer(campaignId, user.id);

    if (!campaign) {
      throw new HttpError(404, "Campaign not found");
    }

    return campaign;
  }
}

export const campaignService = new CampaignService();
