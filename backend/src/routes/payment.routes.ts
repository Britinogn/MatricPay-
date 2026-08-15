import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { asyncHandler } from "../utils/async-handler";

export const paymentRoutes = Router();

paymentRoutes.post(
  "/payments/initiate",
  asyncHandler(paymentController.initiate.bind(paymentController))
);

paymentRoutes.get(
  "/payments/:reference/status",
  asyncHandler(paymentController.getStatus.bind(paymentController))
);

paymentRoutes.post(
  "/webhook/paystack",
  asyncHandler(paymentController.handleWebhook.bind(paymentController))
);
