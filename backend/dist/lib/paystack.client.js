"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystackClient = exports.PaystackClient = void 0;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const http_error_1 = require("../utils/http-error");
class PaystackClient {
    baseUrl = "https://api.paystack.co";
    get headers() {
        return {
            Authorization: `Bearer ${env_1.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
        };
    }
    async initializeTransaction(payload) {
        try {
            const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify(payload),
            });
            const body = await response.json();
            if (!response.ok || !body.status) {
                throw new http_error_1.HttpError(response.status >= 400 && response.status < 500 ? response.status : 502, body.message || "Failed to initialize Paystack transaction");
            }
            return body.data;
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError)
                throw error;
            throw new http_error_1.HttpError(502, `Paystack initialization error: ${error.message}`);
        }
    }
    async verifyTransaction(reference) {
        try {
            const response = await fetch(`${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`, {
                method: "GET",
                headers: this.headers,
            });
            const body = await response.json();
            if (!response.ok || !body.status) {
                throw new http_error_1.HttpError(response.status >= 400 && response.status < 500 ? response.status : 502, body.message || "Failed to verify Paystack transaction");
            }
            return body.data;
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError)
                throw error;
            throw new http_error_1.HttpError(502, `Paystack verification error: ${error.message}`);
        }
    }
    async resolveAccountNumber(payload) {
        try {
            const response = await fetch(`${this.baseUrl}/bank/resolve`, {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify(payload),
            });
            const body = await response.json();
            if (!response.ok || !body.status) {
                throw new http_error_1.HttpError(response.status >= 400 && response.status < 500 ? response.status : 502, body.message || "Failed to resolve account number");
            }
            return body.data;
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError)
                throw error;
            throw new http_error_1.HttpError(502, `Paystack account resolution error: ${error.message}`);
        }
    }
    async createSubaccount(payload) {
        try {
            const response = await fetch(`${this.baseUrl}/subaccount`, {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify(payload),
            });
            const body = await response.json();
            if (!response.ok || !body.status) {
                throw new http_error_1.HttpError(response.status >= 400 && response.status < 500 ? response.status : 502, body.message || "Failed to create subaccount");
            }
            return body.data;
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError)
                throw error;
            throw new http_error_1.HttpError(502, `Paystack subaccount creation error: ${error.message}`);
        }
    }
    async updateSubaccount(code, payload) {
        try {
            const response = await fetch(`${this.baseUrl}/subaccount/${encodeURIComponent(code)}`, {
                method: "PUT",
                headers: this.headers,
                body: JSON.stringify(payload),
            });
            const body = await response.json();
            if (!response.ok || !body.status) {
                throw new http_error_1.HttpError(response.status >= 400 && response.status < 500 ? response.status : 502, body.message || "Failed to update subaccount");
            }
            return body.data;
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError)
                throw error;
            throw new http_error_1.HttpError(502, `Paystack subaccount update error: ${error.message}`);
        }
    }
    verifyWebhookSignature(rawBody, signature) {
        if (!signature)
            return false;
        const hash = crypto_1.default
            .createHmac("sha512", env_1.env.PAYSTACK_SECRET_KEY)
            .update(rawBody)
            .digest("hex");
        try {
            return crypto_1.default.timingSafeEqual(Buffer.from(hash, "utf8"), Buffer.from(signature, "utf8"));
        }
        catch {
            return false;
        }
    }
}
exports.PaystackClient = PaystackClient;
exports.paystackClient = new PaystackClient();
//# sourceMappingURL=paystack.client.js.map