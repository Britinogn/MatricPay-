import { Router } from "express";
import { payoutAccountController } from "../controllers/payout-account.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const payoutAccountRoutes = Router();

// POST /organizer/payout-account/resolve - Resolve bank account name (PUBLIC, no auth)
payoutAccountRoutes.post(
    "/resolve",
    asyncHandler(payoutAccountController.resolveAccount.bind(payoutAccountController))
);

// All routes below require authentication
payoutAccountRoutes.use(authMiddleware);

// POST /organizer/payout-account - Create new subaccount
payoutAccountRoutes.post(
    "/",
    asyncHandler(payoutAccountController.createSubaccount.bind(payoutAccountController))
);

// PATCH /organizer/payout-account/:code - Update subaccount bank details
payoutAccountRoutes.patch(
    "/:code",
    asyncHandler(payoutAccountController.updateSubaccount.bind(payoutAccountController))
);
