"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiatePaymentSchema = void 0;
const zod_1 = require("zod");
exports.initiatePaymentSchema = zod_1.z.object({
    slug: zod_1.z.string().min(1, "Campaign slug is required"),
    matricNumber: zod_1.z.string().min(1, "Matric number is required"),
    fullName: zod_1.z.string().optional(),
    email: zod_1.z.string().email("Invalid email address").optional().or(zod_1.z.literal("")),
    phone: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    level: zod_1.z.string().optional(),
    amount: zod_1.z.coerce.number().positive("Amount must be greater than 0").optional(),
});
//# sourceMappingURL=payment.validator.js.map