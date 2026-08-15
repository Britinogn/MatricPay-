"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
const payment_service_1 = require("../services/payment.service");
const payment_validator_1 = require("../validators/payment.validator");
const http_error_1 = require("../utils/http-error");
class PaymentController {
    async initiate(request, response) {
        const parseResult = payment_validator_1.initiatePaymentSchema.safeParse(request.body);
        if (!parseResult.success) {
            throw new http_error_1.HttpError(400, "Validation failed", parseResult.error.format());
        }
        const result = await payment_service_1.paymentService.initiatePayment(parseResult.data);
        response.status(200).json({
            success: true,
            message: "Payment initiated successfully",
            data: result,
        });
    }
    async getStatus(request, response) {
        const { reference } = request.params;
        if (!reference || typeof reference !== "string") {
            throw new http_error_1.HttpError(400, "Payment reference is required");
        }
        const result = await payment_service_1.paymentService.getPaymentStatus(reference);
        response.status(200).json({
            success: true,
            data: result,
        });
    }
    async handleWebhook(request, response) {
        const signature = request.headers["x-paystack-signature"];
        if (!signature) {
            throw new http_error_1.HttpError(400, "Missing Paystack signature header");
        }
        const rawBody = request.rawBody || JSON.stringify(request.body);
        const result = await payment_service_1.paymentService.handlePaystackWebhook(signature, rawBody, request.body);
        response.status(200).json(result);
    }
}
exports.PaymentController = PaymentController;
exports.paymentController = new PaymentController();
//# sourceMappingURL=payment.controller.js.map