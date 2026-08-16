import type { Request, Response } from "express";
import { payoutAccountService } from "../services/payout-account.service";
import {
    CreateSubaccountSchema,
    ResolveAccountSchema,
    UpdateSubaccountSchema,
} from "../validators/payout-account.validator";

export class PayoutAccountController {
    async resolveAccount(request: Request, response: Response): Promise<void> {
        const data = ResolveAccountSchema.parse(request.body);
        const result = await payoutAccountService.resolveAccountNumber(request.user!.id, data);
        response.status(200).json(result);
    }

    async createSubaccount(request: Request, response: Response): Promise<void> {
        const data = CreateSubaccountSchema.parse(request.body);
        const result = await payoutAccountService.createSubaccount(request.user!.id, data);
        response.status(201).json(result);
    }

    async updateSubaccount(request: Request, response: Response): Promise<void> {
        const data = UpdateSubaccountSchema.parse(request.body);
        const subaccountCode = typeof request.params.code === "string" ? request.params.code : request.params.code[0];

        if (!subaccountCode) {
        throw new Error("Subaccount code is required in URL parameter");
        }

        const result = await payoutAccountService.updateSubaccount(
        request.user!.id,
        subaccountCode,
        data
        );
        response.status(200).json(result);
    }
}

export const payoutAccountController = new PayoutAccountController();
