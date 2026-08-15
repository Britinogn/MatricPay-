"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePaymentReference = generatePaymentReference;
const crypto_1 = __importDefault(require("crypto"));
function generatePaymentReference() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto_1.default.randomBytes(6).toString("hex").toUpperCase();
    return `MP-${timestamp}-${random}`;
}
//# sourceMappingURL=reference.js.map