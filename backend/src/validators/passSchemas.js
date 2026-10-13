import { z } from "zod";

export const verifyPassSchema = z.object({
  passId: z.coerce.number().int().positive(),
  resourceId: z.coerce.number().int().positive(),
});

export const revokePassSchema = z.object({
  reason: z.string().trim().min(5).max(500),
});