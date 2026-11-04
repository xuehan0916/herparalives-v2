import { z } from "zod";
export const phoneSchema = z.string().regex(/^\+[1-9]\d{7,14}$/);
export const otpRequestSchema = z.object({ phone: phoneSchema });
export const otpVerifySchema = z.object({
  phone: phoneSchema,
  token: z.string().regex(/^\d{6}$/),
});
export type AuthStatus = { configured: boolean; userLabel?: string };
