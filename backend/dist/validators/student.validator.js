"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentListQuerySchema = exports.ValidateStudentSchema = exports.CreateStudentsSchema = exports.StudentInputSchema = exports.CampaignSlugParamSchema = exports.CampaignIdParamSchema = void 0;
const zod_1 = require("zod");
const uuidSchema = zod_1.z.uuid({ message: "Invalid campaign ID format" });
exports.CampaignIdParamSchema = zod_1.z.object({
    id: uuidSchema,
});
exports.CampaignSlugParamSchema = zod_1.z.object({
    slug: zod_1.z
        .string()
        .trim()
        .min(1, { message: "Slug is required" })
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Invalid slug format" }),
});
exports.StudentInputSchema = zod_1.z.object({
    matricNumber: zod_1.z
        .string()
        .trim()
        .min(2, { message: "Matric number is required" })
        .max(80, { message: "Matric number must not exceed 80 characters" }),
    fullName: zod_1.z
        .string()
        .trim()
        .min(2, { message: "Full name is required" })
        .max(120, { message: "Full name must not exceed 120 characters" }),
    email: zod_1.z.email({ message: "Invalid email address" }).optional().nullable(),
    phone: zod_1.z.string().trim().max(30).optional().nullable(),
    department: zod_1.z.string().trim().max(120).optional().nullable(),
    level: zod_1.z.string().trim().max(30).optional().nullable(),
});
exports.CreateStudentsSchema = zod_1.z.object({
    students: zod_1.z
        .array(exports.StudentInputSchema)
        .min(1, { message: "At least one student is required" })
        .max(5_000, { message: "Student upload cannot exceed 5000 rows" }),
});
exports.ValidateStudentSchema = zod_1.z.object({
    matricNumber: zod_1.z
        .string()
        .trim()
        .min(2, { message: "Matric number is required" })
        .max(80, { message: "Matric number must not exceed 80 characters" }),
});
exports.StudentListQuerySchema = zod_1.z.object({
    search: zod_1.z.string().trim().min(1).max(120).optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
});
//# sourceMappingURL=student.validator.js.map