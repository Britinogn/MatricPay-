import { Router } from "express";
import { payoutAccountController } from "../controllers/payout-account.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const payoutAccountRoutes = Router();

// All routes require authentication — including /resolve, since there's no
// reason to let unauthenticated requests probe bank account names, and the
// service layer already assumes request.user exists.
payoutAccountRoutes.use(authMiddleware);

// POST /organizer/payout-account/resolve - Resolve bank account name
payoutAccountRoutes.post(
    "/resolve",
    asyncHandler(payoutAccountController.resolveAccount.bind(payoutAccountController))
);

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

payoutAccountRoutes.get(
  "/",
  asyncHandler(payoutAccountController.getPayoutAccount.bind(payoutAccountController))
);