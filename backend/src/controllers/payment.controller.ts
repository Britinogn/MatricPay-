import type { Request, Response } from "express";
import { paymentService } from "../services/payment.service";
import { initiatePaymentSchema } from "../validators/payment.validator";
import { HttpError } from "../utils/http-error";

export class PaymentController {
  async initiate(request: Request, response: Response): Promise<void> {
    const parseResult = initiatePaymentSchema.safeParse(request.body);

    if (!parseResult.success) {
      throw new HttpError(400, "Validation failed", parseResult.error.format());
    }

    const result = await paymentService.initiatePayment(parseResult.data);

    response.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      data: result,
    });
  }

  async getStatus(request: Request, response: Response): Promise<void> {
    const { reference } = request.params;

    if (!reference || typeof reference !== "string") {
      throw new HttpError(400, "Payment reference is required");
    }

    const result = await paymentService.getPaymentStatus(reference);

    response.status(200).json({
      success: true,
      data: result,
    });
  }

  async handleWebhook(request: Request, response: Response): Promise<void> {
    const signature = request.headers["x-paystack-signature"] as string;

    if (!signature) {
      throw new HttpError(400, "Missing Paystack signature header");
    }

    const rawBody = request.rawBody || JSON.stringify(request.body);

    const result = await paymentService.handlePaystackWebhook(
      signature,
      rawBody,
      request.body
    );

    response.status(200).json(result);
  }
}

export const paymentController = new PaymentController();
