"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignController = exports.CampaignController = void 0;
const http_error_1 = require("../utils/http-error");
const campaign_service_1 = require("../services/campaign.service");
const campaign_validator_1 = require("../validators/campaign.validator");
function requireAuthenticatedUser(request) {
    if (!request.user) {
        throw new http_error_1.HttpError(401, "Unauthorized");
    }
    return request.user;
}
class CampaignController {
    async create(request, response) {
        const user = requireAuthenticatedUser(request);
        const data = campaign_validator_1.CreateCampaignSchema.parse(request.body);
        const result = await campaign_service_1.campaignService.createCampaign(user, data);
        response.status(201).json(result);
    }
    async list(request, response) {
        const user = requireAuthenticatedUser(request);
        const query = campaign_validator_1.CampaignListQuerySchema.parse(request.query);
        const result = await campaign_service_1.campaignService.listCampaigns(user, query);
        response.status(200).json(result);
    }
    async getById(request, response) {
        const user = requireAuthenticatedUser(request);
        const { id } = campaign_validator_1.CampaignIdParamSchema.parse(request.params);
        const result = await campaign_service_1.campaignService.getCampaign(user, id);
        response.status(200).json(result);
    }
    async update(request, response) {
        const user = requireAuthenticatedUser(request);
        const { id } = campaign_validator_1.CampaignIdParamSchema.parse(request.params);
        const data = campaign_validator_1.UpdateCampaignSchema.parse(request.body);
        const result = await campaign_service_1.campaignService.updateCampaign(user, id, data);
        response.status(200).json(result);
    }
    async updateStatus(request, response) {
        const user = requireAuthenticatedUser(request);
        const { id } = campaign_validator_1.CampaignIdParamSchema.parse(request.params);
        const data = campaign_validator_1.UpdateCampaignStatusSchema.parse(request.body);
        const result = await campaign_service_1.campaignService.updateCampaignStatus(user, id, data);
        response.status(200).json(result);
    }
    async getBySlug(request, response) {
        const { slug } = campaign_validator_1.CampaignSlugParamSchema.parse(request.params);
        const result = await campaign_service_1.campaignService.getPublicCampaignBySlug(slug);
        response.status(200).json(result);
    }
}
exports.CampaignController = CampaignController;
exports.campaignController = new CampaignController();
//# sourceMappingURL=campaign.controller.js.map