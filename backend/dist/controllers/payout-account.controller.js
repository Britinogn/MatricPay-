"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payoutAccountController = exports.PayoutAccountController = void 0;
const payout_account_service_1 = require("../services/payout-account.service");
const payout_account_validator_1 = require("../validators/payout-account.validator");
class PayoutAccountController {
    async getPayoutAccount(request, response) {
        const result = await payout_account_service_1.payoutAccountService.getPayoutAccount(request.user.id);
        response.status(200).json({
            success: true,
            data: result,
        });
    }
    async resolveAccount(request, response) {
        const data = payout_account_validator_1.ResolveAccountSchema.parse(request.body);
        const result = await payout_account_service_1.payoutAccountService.resolveAccountNumber(request.user.id, data);
        response.status(200).json(result);
    }
    async createSubaccount(request, response) {
        const data = payout_account_validator_1.CreateSubaccountSchema.parse(request.body);
        const result = await payout_account_service_1.payoutAccountService.createSubaccount(request.user.id, data);
        response.status(201).json(result);
    }
    async updateSubaccount(request, response) {
        const data = payout_account_validator_1.UpdateSubaccountSchema.parse(request.body);
        const subaccountCode = typeof request.params.code === "string" ? request.params.code : request.params.code[0];
        if (!subaccountCode) {
            throw new Error("Subaccount code is required in URL parameter");
        }
        const result = await payout_account_service_1.payoutAccountService.updateSubaccount(request.user.id, subaccountCode, data);
        response.status(200).json(result);
    }
}
exports.PayoutAccountController = PayoutAccountController;
exports.payoutAccountController = new PayoutAccountController();
//# sourceMappingURL=payout-account.controller.js.map