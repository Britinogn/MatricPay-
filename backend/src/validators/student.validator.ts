import { z } from "zod";

const uuidSchema = z.uuid({ message: "Invalid campaign ID format" });

export const CampaignIdParamSchema = z.object({
  id: uuidSchema,
});

export const CampaignSlugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, { message: "Slug is required" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Invalid slug format" }),
});

export const StudentInputSchema = z.object({
  matricNumber: z
    .string()
    .trim()
    .min(2, { message: "Matric number is required" })
    .max(80, { message: "Matric number must not exceed 80 characters" }),
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Full name is required" })
    .max(120, { message: "Full name must not exceed 120 characters" }),
  email: z.email({ message: "Invalid email address" }).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  department: z.string().trim().max(120).optional().nullable(),
  level: z.string().trim().max(30).optional().nullable(),
});

export const CreateStudentsSchema = z.object({
  students: z
    .array(StudentInputSchema)
    .min(1, { message: "At least one student is required" })
    .max(5_000, { message: "Student upload cannot exceed 5000 rows" }),
});

export const ValidateStudentSchema = z.object({
  matricNumber: z
    .string()
    .trim()
    .min(2, { message: "Matric number is required" })
    .max(80, { message: "Matric number must not exceed 80 characters" }),
});

export const StudentListQuerySchema = z.object({
  search: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type StudentInput = z.infer<typeof StudentInputSchema>;
export type CreateStudentsInput = z.infer<typeof CreateStudentsSchema>;
export type ValidateStudentInput = z.infer<typeof ValidateStudentSchema>;
export type StudentListQueryInput = z.infer<typeof StudentListQuerySchema>;
