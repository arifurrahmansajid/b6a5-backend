import { auth } from "@/app/middlewares/auth-middleware";
import { validateRequest } from "@/app/middlewares/validate-request.middleware";
import { Router } from "express";
import { authController } from "./auth.controller";
import {
  changePasswordSchema,
  passwordResetSchema,
  requestPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from "./auth.validation";

const router: Router = Router();

router.post("/sign-up", validateRequest(signUpSchema), authController.signUp);

router.post("/verify-email", validateRequest(verifyEmailSchema), authController.verifyEmail);

router.post("/sign-in", validateRequest(signInSchema), authController.signIn);

router.post("/refresh-token", authController.refreshTokens);

router.post(
  "/change-password",
  validateRequest(changePasswordSchema),
  authController.changePassword,
);

router.post(
  "/forgot-password",
  validateRequest(requestPasswordSchema),
  authController.requestPasswordReset,
);

router.post("/reset-password", validateRequest(passwordResetSchema), authController.passwordReset);

router.post("/logout", authController.logout);

router.post("/session", auth(), authController.getSession);

export const authRoutes = router;
