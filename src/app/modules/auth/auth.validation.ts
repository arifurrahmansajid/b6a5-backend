import z from "zod";

export const signUpSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.email().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must not exceed 64 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[^A-Za-z0-9]/, "Must include at least one special character")
    .regex(/^\S*$/, "Password must not contain spaces"),
});
export type SignUpPayload = z.infer<typeof signUpSchema>;

export const verifyEmailSchema = z.object({
  email: z.email().toLowerCase(),
  otp: z
    .string()
    .length(5, "OTP must be exactly 5 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});
export type VerifyEmailPayload = z.infer<typeof verifyEmailSchema>;

export const signInSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});
export type SignInSchemaPayload = z.infer<typeof signInSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must not exceed 64 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[^A-Za-z0-9]/, "Must include at least one special character")
    .regex(/^\S*$/, "Password must not contain spaces"),
});
export type ChangePasswordPayload = z.infer<typeof changePasswordSchema>;

export const requestPasswordSchema = z.object({
  email: z.email().toLowerCase(),
});
export type RequestPasswordPayload = z.infer<typeof requestPasswordSchema>;

export const passwordResetSchema = z.object({
  email: z.email().toLowerCase(),
  otp: z
    .string()
    .length(5, "OTP must be exactly 5 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must not exceed 64 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[^A-Za-z0-9]/, "Must include at least one special character")
    .regex(/^\S*$/, "Password must not contain spaces"),
});
export type PasswordResetPayload = z.infer<typeof passwordResetSchema>;
