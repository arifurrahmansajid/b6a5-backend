import { auth } from "@/app/middlewares/auth-middleware";
import { validateRequest } from "@/app/middlewares/validate-request.middleware";
import { Role } from "@/generated/prisma/enums";
import { Router } from "express";
import { userController } from "./user.controller";
import { onboardingSchema, updateUserTypeStatusSchema } from "./user.validation";

const router: Router = Router();

router.post("/me/onboarding", auth(), validateRequest(onboardingSchema), userController.onboarding);

router.get("/all-users", auth([Role.ADMIN, Role.SUPER_ADMIN]), userController.getAllUsers);

router.get(
  "/all-volunteers",
  auth([Role.ADMIN, Role.SUPER_ADMIN]),
  userController.getAllVolunteers,
);

router.get("/all-donors", auth([Role.ADMIN, Role.SUPER_ADMIN]), userController.getAllDonors);

router.get(
  "/all-organizations",
  auth([Role.ADMIN, Role.SUPER_ADMIN]),
  userController.getAllOrganizations,
);

router.put(
  "/user-type-entries/:userTypeEntryId/status",
  auth([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(updateUserTypeStatusSchema),
  userController.updateUserTypeStatus,
);

export const userRoutes = router;
