import { z } from 'zod';

const utf8ByteLength = (value: string) => new TextEncoder().encode(value).length;

export const emailSchema = z
  .string({ required_error: 'Email is required', invalid_type_error: 'Email must be text' })
  .trim()
  .min(1, 'Email is required')
  .max(254, 'Email must be at most 254 characters')
  .email('Enter a valid email address')
  .transform((v) => v.toLowerCase());

/**
 * Password policy: 8+ characters, at least one letter and one number.
 * bcrypt silently truncates input beyond 72 bytes, so we cap it at 72 bytes (not chars).
 */
export const passwordSchema = z
  .string({ required_error: 'Password is required', invalid_type_error: 'Password must be text' })
  .min(8, 'Password must be at least 8 characters')
  .refine((v) => utf8ByteLength(v) <= 72, 'Password is too long (max 72 bytes)')
  .refine((v) => /[A-Za-z]/.test(v), 'Password must contain at least one letter')
  .refine((v) => /\d/.test(v), 'Password must contain at least one number');

export const registerSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required', invalid_type_error: 'Full name must be text' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters'),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  // Login does not re-apply the full policy (don't leak policy details), only basic bounds.
  password: z
    .string({ required_error: 'Password is required', invalid_type_error: 'Password must be text' })
    .min(1, 'Password is required')
    .max(128, 'Password is too long'),
});

/** Mobile clients send the refresh token in the body; web relies on the httpOnly cookie. */
export const refreshSchema = z.object({
  refreshToken: z.string().min(1).max(512).optional(),
});

export const logoutSchema = refreshSchema;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
