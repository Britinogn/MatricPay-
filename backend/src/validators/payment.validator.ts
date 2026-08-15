import { z } from "zod";

export const initiatePaymentSchema = z.object({
  slug: z.string().min(1, "Campaign slug is required"),
  matricNumber: z.string().min(1, "Matric number is required"),
  fullName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0").optional(),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
