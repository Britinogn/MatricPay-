"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const async_handler_1 = require("../utils/async-handler");
exports.paymentRoutes = (0, express_1.Router)();
exports.paymentRoutes.post("/payments/initiate", (0, async_handler_1.asyncHandler)(payment_controller_1.paymentController.initiate.bind(payment_controller_1.paymentController)));
exports.paymentRoutes.get("/payments/:reference/status", (0, async_handler_1.asyncHandler)(payment_controller_1.paymentController.getStatus.bind(payment_controller_1.paymentController)));
exports.paymentRoutes.post("/webhook/paystack", (0, async_handler_1.asyncHandler)(payment_controller_1.paymentController.handleWebhook.bind(payment_controller_1.paymentController)));
//# sourceMappingURL=payment.routes.js.map