import { z } from "zod";

export const resourceSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(5000).optional().nullable(),
  location: z.string().trim().max(255).optional().nullable(),
  category: z.string().trim().max(100).optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const resourceUpdateSchema = resourceSchema.partial();

export const idSchema = z.coerce.number().int().positive();