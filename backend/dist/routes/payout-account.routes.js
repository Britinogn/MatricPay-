"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payoutAccountRoutes = void 0;
const express_1 = require("express");
const payout_account_controller_1 = require("../controllers/payout-account.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const async_handler_1 = require("../utils/async-handler");
exports.payoutAccountRoutes = (0, express_1.Router)();
// All routes require authentication — including /resolve, since there's no
// reason to let unauthenticated requests probe bank account names, and the
// service layer already assumes request.user exists.
exports.payoutAccountRoutes.use(auth_middleware_1.authMiddleware);
// POST /organizer/payout-account/resolve - Resolve bank account name
exports.payoutAccountRoutes.post("/resolve", (0, async_handler_1.asyncHandler)(payout_account_controller_1.payoutAccountController.resolveAccount.bind(payout_account_controller_1.payoutAccountController)));
// POST /organizer/payout-account - Create new subaccount
exports.payoutAccountRoutes.post("/", (0, async_handler_1.asyncHandler)(payout_account_controller_1.payoutAccountController.createSubaccount.bind(payout_account_controller_1.payoutAccountController)));
// PATCH /organizer/payout-account/:code - Update subaccount bank details
exports.payoutAccountRoutes.patch("/:code", (0, async_handler_1.asyncHandler)(payout_account_controller_1.payoutAccountController.updateSubaccount.bind(payout_account_controller_1.payoutAccountController)));
exports.payoutAccountRoutes.get("/", (0, async_handler_1.asyncHandler)(payout_account_controller_1.payoutAccountController.getPayoutAccount.bind(payout_account_controller_1.payoutAccountController)));
//# sourceMappingURL=payout-account.routes.js.map