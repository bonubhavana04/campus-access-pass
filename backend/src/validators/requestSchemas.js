import { z } from "zod";

const dateTimeWithOffset = z.string().datetime({ offset: true });

export const createRequestSchema = z
  .object({
    resourceId: z.coerce.number().int().positive(),
    purpose: z.string().trim().min(5).max(500),
    startTime: dateTimeWithOffset,
    endTime: dateTimeWithOffset,
  })
  .refine(
    (data) => new Date(data.endTime) > new Date(data.startTime),
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export const decisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
});