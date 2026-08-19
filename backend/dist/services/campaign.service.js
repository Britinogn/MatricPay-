"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignService = exports.CampaignService = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const campaign_repository_1 = require("../repositories/campaign.repository");
const user_repository_1 = require("../repositories/user.repository");
const http_error_1 = require("../utils/http-error");
const slug_1 = require("../utils/slug");
const MAX_SLUG_ATTEMPTS = 5;
function toCampaignResponse(campaign) {
    const isExpired = campaign.status === client_1.CampaignStatus.active &&
        campaign.expiresAt !== null &&
        campaign.expiresAt.getTime() < Date.now();
    return {
        ...campaign,
        isExpired,
    };
}
function toDateOrNull(value) {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return new Date(value);
}
function validateCampaignTypeRules(campaignType, amountType) {
    if (campaignType === client_1.CampaignType.restricted && amountType !== "fixed") {
        throw new http_error_1.HttpError(400, "Restricted campaigns must use a fixed amount");
    }
}
class CampaignService {
    async generateUniqueSlug(title) {
        for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
            const slug = (0, slug_1.generateCampaignSlug)(title);
            const exists = await campaign_repository_1.campaignRepository.slugExists(slug);
            if (!exists) {
                return slug;
            }
        }
        throw new http_error_1.HttpError(500, "Could not generate a unique campaign slug");
    }
    async createCampaign(user, data) {
        validateCampaignTypeRules(data.campaignType, data.amountType);
        const slug = await this.generateUniqueSlug(data.title);
        const paymentLink = `${env_1.env.CLIENT_URL}/pay/${slug}`;
        const expiresAt = toDateOrNull(data.expiresAt);
        const createData = {
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
            status: client_1.CampaignStatus.draft,
        };
        if (expiresAt !== undefined) {
            createData.expiresAt = expiresAt;
        }
        const campaign = await campaign_repository_1.campaignRepository.create(createData);
        return { campaign: toCampaignResponse(campaign) };
    }
    async listCampaigns(user, query) {
        const result = await campaign_repository_1.campaignRepository.listByOrganizer({
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
    async getCampaign(user, campaignId) {
        const campaign = await this.getOwnedCampaign(user, campaignId);
        return { campaign: toCampaignResponse(campaign) };
    }
    async updateCampaign(user, campaignId, data) {
        const campaign = await this.getOwnedCampaign(user, campaignId);
        if (campaign.status !== client_1.CampaignStatus.draft) {
            throw new http_error_1.HttpError(400, "Only draft campaigns can be updated");
        }
        const nextCampaignType = data.campaignType ?? campaign.campaignType;
        const nextAmountType = data.amountType ?? campaign.amountType;
        validateCampaignTypeRules(nextCampaignType, nextAmountType);
        const updateData = {};
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
        const updatedCampaign = await campaign_repository_1.campaignRepository.update(campaign.id, updateData);
        return { campaign: toCampaignResponse(updatedCampaign) };
    }
    async updateCampaignStatus(user, campaignId, data) {
        if (data.status === client_1.CampaignStatus.active) {
            return this.activateCampaign(user, campaignId);
        }
        return this.closeCampaign(user, campaignId);
    }
    async getPublicCampaignBySlug(slug) {
        const campaign = await campaign_repository_1.campaignRepository.findBySlug(slug);
        if (!campaign) {
            throw new http_error_1.HttpError(404, "Campaign not found");
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
                isExpired: campaign.status === client_1.CampaignStatus.active &&
                    campaign.expiresAt !== null &&
                    campaign.expiresAt.getTime() < Date.now(),
            },
        };
    }
    async activateCampaign(user, campaignId) {
        const campaign = await this.getOwnedCampaign(user, campaignId);
        if (campaign.status !== client_1.CampaignStatus.draft) {
            throw new http_error_1.HttpError(400, "Only draft campaigns can be activated");
        }
        if (campaign.expiresAt && campaign.expiresAt.getTime() < Date.now()) {
            throw new http_error_1.HttpError(400, "Expired campaigns cannot be activated");
        }
        // Check that organizer has set up payout account
        const organizer = await user_repository_1.userRepository.findById(campaign.organizerId);
        if (!organizer?.paystackSubaccountCode) {
            throw new http_error_1.HttpError(400, "Payout account must be set up before activating campaigns");
        }
        if (campaign.campaignType === client_1.CampaignType.restricted) {
            const studentCount = await campaign_repository_1.campaignRepository.countStudents(campaign.id);
            const completedImportCount = await campaign_repository_1.campaignRepository.countCompletedStudentImports(campaign.id);
            if (studentCount === 0 && completedImportCount === 0) {
                throw new http_error_1.HttpError(400, "Restricted campaigns require students before activation");
            }
        }
        const updatedCampaign = await campaign_repository_1.campaignRepository.update(campaign.id, {
            status: client_1.CampaignStatus.active,
        });
        return { campaign: toCampaignResponse(updatedCampaign) };
    }
    async closeCampaign(user, campaignId) {
        const campaign = await this.getOwnedCampaign(user, campaignId);
        if (campaign.status !== client_1.CampaignStatus.active) {
            throw new http_error_1.HttpError(400, "Only active campaigns can be closed");
        }
        const updatedCampaign = await campaign_repository_1.campaignRepository.update(campaign.id, {
            status: client_1.CampaignStatus.closed,
        });
        return { campaign: toCampaignResponse(updatedCampaign) };
    }
    async getOwnedCampaign(user, campaignId) {
        const campaign = user.role === client_1.UserRole.admin
            ? await campaign_repository_1.campaignRepository.findById(campaignId)
            : await campaign_repository_1.campaignRepository.findByIdForOrganizer(campaignId, user.id);
        if (!campaign) {
            throw new http_error_1.HttpError(404, "Campaign not found");
        }
        return campaign;
    }
    async deleteCampaign(user, campaignId) {
        const campaign = await this.getOwnedCampaign(user, campaignId);
        if (campaign.status !== client_1.CampaignStatus.draft) {
            throw new http_error_1.HttpError(400, "Only draft campaigns can be deleted. Close active campaigns instead.");
        }
        const paymentCount = await campaign_repository_1.campaignRepository.countPayments(campaign.id);
        if (paymentCount > 0) {
            throw new http_error_1.HttpError(400, "Cannot delete a campaign that already has payments");
        }
        // Remove students first if cascade is not set on the relation
        await campaign_repository_1.campaignRepository.deleteStudentsByCampaignId(campaign.id);
        await campaign_repository_1.campaignRepository.delete(campaign.id);
        return { success: true };
    }
    async bulkDeleteCampaigns(user, campaignIds) {
        const campaigns = [];
        for (const id of campaignIds) {
            const campaign = await this.getOwnedCampaign(user, id);
            if (!campaign) {
                throw new http_error_1.HttpError(404, "Campaign not found");
            }
            if (campaign.status !== client_1.CampaignStatus.draft) {
                throw new http_error_1.HttpError(400, "Only draft campaigns can be deleted");
            }
            const paymentCount = await campaign_repository_1.campaignRepository.countPayments(campaign.id);
            if (paymentCount > 0) {
                throw new http_error_1.HttpError(400, "Cannot delete a campaign that already has payments");
            }
            campaigns.push(campaign);
        }
        // Perform bulk deletion in a single transaction
        await campaign_repository_1.campaignRepository.bulkDelete(campaigns.map((c) => c.id));
        return {
            success: true,
            deletedCount: campaigns.length,
        };
    }
}
exports.CampaignService = CampaignService;
exports.campaignService = new CampaignService();
//# sourceMappingURL=campaign.service.js.map