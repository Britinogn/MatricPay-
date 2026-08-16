import { UserRole } from "@prisma/client";
import { paystackClient } from "../lib/paystack.client";
import { paymentRepository } from "../repositories/payment.repository";
import { userRepository } from "../repositories/user.repository";
import { HttpError } from "../utils/http-error";
import {
  CreateSubaccountInput,
  ResolveAccountInput,
  UpdateSubaccountInput,
} from "../validators/payout-account.validator";

export class PayoutAccountService {
    async resolveAccountNumber(userId: string, data: ResolveAccountInput) {
        // Verify user exists
        const user = await userRepository.findById(userId);
        if (!user) {
        throw new HttpError(404, "User not found");
        }

        // Call Paystack API to resolve account
        const accountData = await paystackClient.resolveAccountNumber({
        account_number: data.account_number,
        bank_code: data.bank_code,
        });

        // Log audit event
        await paymentRepository.createAuditLog({
        actorId: userId,
        actorRole: user.role as UserRole,
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

    async createSubaccount(userId: string, data: CreateSubaccountInput) {
        // Verify user exists
        const user = await userRepository.findById(userId);
        if (!user) {
        throw new HttpError(404, "User not found");
        }

        // Check if subaccount already exists
        if (user.paystackSubaccountCode) {
        throw new HttpError(
            400,
            "Subaccount already exists for this user. Use update instead."
        );
        }

        // Call Paystack API to create subaccount
        const subaccountResponse = await paystackClient.createSubaccount({
        business_name: data.business_name,
        settlement_bank: data.settlement_bank,
        account_number: data.account_number,
        percentage_charge: data.percentage_charge,
        });

        // Store subaccount code and details in user record
        const updatedUser = await userRepository.update(userId, {
        paystackSubaccountCode: subaccountResponse.subaccount_code,
        settlementBankCode: data.settlement_bank,
        settlementAccountNumber: data.account_number,
        settlementAccountName: subaccountResponse.business_name,
        });

        // Log audit event
        await paymentRepository.createAuditLog({
        actorId: userId,
        actorRole: user.role as UserRole,
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

    async updateSubaccount(
        userId: string,
        code: string,
        data: UpdateSubaccountInput
    ) {
        // Verify user exists
        const user = await userRepository.findById(userId);
        if (!user) {
        throw new HttpError(404, "User not found");
        }

        // Verify subaccount code matches user's code
        if (user.paystackSubaccountCode !== code) {
        throw new HttpError(403, "Cannot update subaccount that does not belong to this user");
        }

        // Call Paystack API to update subaccount (only include provided fields)
        const updatePayload: any = {};
        if (data.business_name !== undefined) updatePayload.business_name = data.business_name;
        if (data.settlement_bank !== undefined) updatePayload.settlement_bank = data.settlement_bank;
        if (data.account_number !== undefined) updatePayload.account_number = data.account_number;

        const subaccountResponse = await paystackClient.updateSubaccount(code, updatePayload);

        // Update user record with new details (only update provided fields)
        const updateData: Record<string, string> = {};
        if (data.settlement_bank !== undefined) updateData.settlementBankCode = data.settlement_bank;
        if (data.account_number !== undefined) updateData.settlementAccountNumber = data.account_number;
        if (data.business_name !== undefined) updateData.settlementAccountName = data.business_name;

        const updatedUser = await userRepository.update(userId, updateData);

        // Log audit event
        await paymentRepository.createAuditLog({
        actorId: userId,
        actorRole: user.role as UserRole,
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

export const payoutAccountService = new PayoutAccountService();
