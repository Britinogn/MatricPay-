"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payoutAccountService = exports.PayoutAccountService = void 0;
const paystack_client_1 = require("../lib/paystack.client");
const payment_repository_1 = require("../repositories/payment.repository");
const user_repository_1 = require("../repositories/user.repository");
const http_error_1 = require("../utils/http-error");
class PayoutAccountService {
    async resolveAccountNumber(userId, data) {
        // Verify user exists
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new http_error_1.HttpError(404, "User not found");
        }
        // Call Paystack API to resolve account
        const accountData = await paystack_client_1.paystackClient.resolveAccountNumber({
            account_number: data.account_number,
            bank_code: data.bank_code,
        });
        // Log audit event
        await payment_repository_1.paymentRepository.createAuditLog({
            actorId: userId,
            actorRole: user.role,
            event: "payout_account.resolved",
            entityType: "PayoutAccount",
            entityId: userId,
            metadata: {
                bank_code: data.bank_code,
                account_number: data.account_number,
                account_name: accountData.account_name,
            },
        });
        return accountData;
    }
    async createSubaccount(userId, data) {
        // Verify user exists
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new http_error_1.HttpError(404, "User not found");
        }
        // Check if subaccount already exists
        if (user.paystackSubaccountCode) {
            throw new http_error_1.HttpError(400, "Subaccount already exists for this user. Use update instead.");
        }
        // Call Paystack API to create subaccount
        const subaccountResponse = await paystack_client_1.paystackClient.createSubaccount({
            business_name: data.business_name,
            settlement_bank: data.settlement_bank,
            account_number: data.account_number,
            percentage_charge: data.percentage_charge,
        });
        // Store subaccount code and details in user record
        const updatedUser = await user_repository_1.userRepository.update(userId, {
            paystackSubaccountCode: subaccountResponse.subaccount_code,
            settlementBankCode: data.settlement_bank,
            settlementAccountNumber: data.account_number,
            settlementAccountName: subaccountResponse.business_name,
        });
        // Log audit event
        await payment_repository_1.paymentRepository.createAuditLog({
            actorId: userId,
            actorRole: user.role,
            event: "payout_account.created",
            entityType: "PayoutAccount",
            entityId: userId,
            metadata: {
                subaccount_code: subaccountResponse.subaccount_code,
                business_name: subaccountResponse.business_name,
                settlement_bank: data.settlement_bank,
                account_number: data.account_number,
            },
        });
        return {
            subaccount_code: updatedUser.paystackSubaccountCode,
            account_name: updatedUser.settlementAccountName,
            account_number: updatedUser.settlementAccountNumber,
            bank_code: updatedUser.settlementBankCode,
        };
    }
    async updateSubaccount(userId, code, data) {
        // Verify user exists
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new http_error_1.HttpError(404, "User not found");
        }
        // Verify subaccount code matches user's code
        if (user.paystackSubaccountCode !== code) {
            throw new http_error_1.HttpError(403, "Cannot update subaccount that does not belong to this user");
        }
        // Call Paystack API to update subaccount (only include provided fields)
        const updatePayload = {};
        if (data.business_name !== undefined)
            updatePayload.business_name = data.business_name;
        if (data.settlement_bank !== undefined)
            updatePayload.settlement_bank = data.settlement_bank;
        if (data.account_number !== undefined)
            updatePayload.account_number = data.account_number;
        const subaccountResponse = await paystack_client_1.paystackClient.updateSubaccount(code, updatePayload);
        // Update user record with new details (only update provided fields)
        const updateData = {};
        if (data.settlement_bank !== undefined)
            updateData.settlementBankCode = data.settlement_bank;
        if (data.account_number !== undefined)
            updateData.settlementAccountNumber = data.account_number;
        if (data.business_name !== undefined)
            updateData.settlementAccountName = data.business_name;
        const updatedUser = await user_repository_1.userRepository.update(userId, updateData);
        // Log audit event
        await payment_repository_1.paymentRepository.createAuditLog({
            actorId: userId,
            actorRole: user.role,
            event: "payout_account.updated",
            entityType: "PayoutAccount",
            entityId: userId,
            metadata: {
                subaccount_code: code,
                updated_fields: Object.keys(updateData),
                business_name: subaccountResponse.business_name,
                settlement_bank: subaccountResponse.settlement_bank,
                account_number: subaccountResponse.account_number,
            },
        });
        return {
            subaccount_code: updatedUser.paystackSubaccountCode,
            account_name: updatedUser.settlementAccountName,
            account_number: updatedUser.settlementAccountNumber,
            bank_code: updatedUser.settlementBankCode,
        };
    }
}
exports.PayoutAccountService = PayoutAccountService;
exports.payoutAccountService = new PayoutAccountService();
//# sourceMappingURL=payout-account.service.js.map