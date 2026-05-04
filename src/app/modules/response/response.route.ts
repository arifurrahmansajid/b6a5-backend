import { auth } from "@/app/middlewares/auth-middleware";
import { validateRequest } from "@/app/middlewares/validate-request.middleware";
import { UserType } from "@/generated/prisma/enums";
import { Router } from "express";
import { responseController } from "./response.controller";
import { createResponseSchema, updateResponseSchema } from "./response.validation";

const router: Router = Router();

router.post(
  "/",
  auth([], [UserType.VOLUNTEER, UserType.DONOR, UserType.ORGANIZATION]),
  validateRequest(createResponseSchema),
  responseController.createResponse,
);

router.get("/", auth(), responseController.getResponses);

router.get("/me", auth(), responseController.getMyResponses);

router.get("/:id", auth(), responseController.getResponseById);

router.patch(
  "/:id",
  auth(),
  validateRequest(updateResponseSchema),
  responseController.updateResponse,
);

router.delete("/:id", auth(), responseController.deleteResponse);

export const responseRoutes = router;
