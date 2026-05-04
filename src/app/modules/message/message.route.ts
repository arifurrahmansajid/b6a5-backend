import { auth } from "@/app/middlewares/auth-middleware";
import { validateRequest } from "@/app/middlewares/validate-request.middleware";
import { Router } from "express";
import { messageController } from "./message.controller";
import { createMessageSchema, updateMessageSchema } from "./message.validation";

const router: Router = Router();

router.post("/", auth(), validateRequest(createMessageSchema), messageController.createMessage);

router.get("/", auth(), messageController.getMessages);

router.get("/me", auth(), messageController.getMyMessages);

router.get("/:id", auth(), messageController.getMessageById);

router.patch("/:id", auth(), validateRequest(updateMessageSchema), messageController.updateMessage);

router.delete("/:id", auth(), messageController.deleteMessage);

router.get("/conversation/:requestId/:participantId", auth(), messageController.getConversation);

export const messageRoutes = router;
