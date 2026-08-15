import crypto from "crypto";
import { env } from "../config/env";
import { HttpError } from "../utils/http-error";

export interface InitializeTransactionPayload {
  email: string;
  amount: number; // in kobo (NGN * 100)
  reference: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

export interface InitializeTransactionResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface VerifyTransactionData {
  id: number;
  domain: string;
  status: string; // 'success', 'failed', 'abandoned'
  reference: string;
  amount: number; // in kobo
  gateway_response: string;
  paid_at: string | null;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string | null;
  metadata: Record<string, any> | null;
  customer: {
    id: number;
    email: string;
    customer_code: string;
  };
}

export class PaystackClient {
  private readonly baseUrl = "https://api.paystack.co";

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    };
  }

  async initializeTransaction(
    payload: InitializeTransactionPayload
  ): Promise<InitializeTransactionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(payload),
      });

      const body = await response.json();

      if (!response.ok || !body.status) {
        throw new HttpError(
          response.status >= 400 && response.status < 500 ? response.status : 502,
          body.message || "Failed to initialize Paystack transaction"
        );
      }

      return body.data as InitializeTransactionResponse;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(502, `Paystack initialization error: ${(error as Error).message}`);
    }
  }

  async verifyTransaction(reference: string): Promise<VerifyTransactionData> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
        {
          method: "GET",
          headers: this.headers,
        }
      );

      const body = await response.json();

      if (!response.ok || !body.status) {
        throw new HttpError(
          response.status >= 400 && response.status < 500 ? response.status : 502,
          body.message || "Failed to verify Paystack transaction"
        );
      }

      return body.data as VerifyTransactionData;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(502, `Paystack verification error: ${(error as Error).message}`);
    }
  }

  verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean {
    if (!signature) return false;

    const hash = crypto
      .createHmac("sha512", env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    try {
      return crypto.timingSafeEqual(
        Buffer.from(hash, "utf8"),
        Buffer.from(signature, "utf8")
      );
    } catch {
      return false;
    }
  }
}

export const paystackClient = new PaystackClient();
