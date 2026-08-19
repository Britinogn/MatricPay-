"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payoutAccountService = exports.PayoutAccountService = void 0;
const paystack_client_1 = require("../lib/paystack.client");
const payment_repository_1 = require("../repositories/payment.repository");
const user_repository_1 = require("../repositories/user.repository");
const http_error_1 = require("../utils/http-error");
class PayoutAccountService {
    async getPayoutAccount(userId) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new http_error_1.HttpError(404, "User not found");
        }
        return {
            paystackSubaccountCode: user.paystackSubaccountCode ?? null,
            settlementBankCode: user.settlementBankCode ?? null,
            settlementAccountNumber: user.settlementAccountNumber ?? null,
            settlementAccountName: user.settlementAccountName ?? null,
        };
    }
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
        // Independently resolve the account before creating anything, regardless
        // of whether the client already called /resolve. This guarantees the
        // account number is genuinely valid, and that the name we store is what
        // Paystack actually found — never something the client could supply
        // directly. A mistyped account number throws here, before any
        // subaccount exists.
        const resolved = await paystack_client_1.paystackClient.resolveAccountNumber({
            account_number: data.account_number,
            bank_code: data.settlement_bank,
        });
        // Call Paystack API to create subaccount
        const subaccountResponse = await paystack_client_1.paystackClient.createSubaccount({
            business_name: data.business_name,
            settlement_bank: data.settlement_bank,
            account_number: data.account_number,
            percentage_charge: data.percentage_charge,
        });
        // Store subaccount code and details in user record — settlementAccountName
        // is the resolved account holder's name, not the client-supplied
        // business_name (those are two different things: business_name is an
        // arbitrary label, settlementAccountName is who Paystack says owns the
        // bank account).
        const updatedUser = await user_repository_1.userRepository.update(userId, {
            paystackSubaccountCode: subaccountResponse.subaccount_code,
            settlementBankCode: data.settlement_bank,
            settlementAccountNumber: data.account_number,
            settlementAccountName: resolved.account_name,
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
                resolved_account_name: resolved.account_name,
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
        // If the bank/account number is changing, independently re-resolve it
        // first — same reasoning as createSubaccount: never trust that the
        // client already confirmed the right name, verify it here regardless.
        let resolvedAccountName;
        if (data.settlement_bank !== undefined && data.account_number !== undefined) {
            const resolved = await paystack_client_1.paystackClient.resolveAccountNumber({
                account_number: data.account_number,
                bank_code: data.settlement_bank,
            });
            resolvedAccountName = resolved.account_name;
        }
        else if (data.settlement_bank !== undefined || data.account_number !== undefined) {
            // Both must be provided together — resolving needs both to mean anything,
            // and updating just one half would leave the subaccount pointing at a
            // bank/account pair that was never actually verified as a real match.
            throw new http_error_1.HttpError(400, "settlement_bank and account_number must be provided together");
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
        if (resolvedAccountName !== undefined)
            updateData.settlementAccountName = resolvedAccountName;
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