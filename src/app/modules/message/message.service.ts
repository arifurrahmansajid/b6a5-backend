import { prisma } from "@/app/lib/prisma";
import type { TokenPayload } from "@/app/types";
import AppError from "@/app/utils/app-error.util";
import { paginationUtils } from "@/app/utils/pagination.util";
import { parseSchema } from "@/app/utils/zod-error.util";
import type { MessageInclude, MessageWhereInput } from "@/generated/prisma/models";
import status from "http-status";
import { messageConsts } from "./message.const";
import { messageRepository } from "./message.repository";
import type { CreateMessagePayload, UpdateMessagePayload } from "./message.type";
import { messageListQuerySchema } from "./message.validation";

const createMessage = async (user: TokenPayload, payload: CreateMessagePayload) => {
  // Check if request exists
  const request = await prisma.request.findUnique({
    where: { id: payload.requestId },
    select: { id: true, createdBy: true },
  });

  if (!request) {
    throw new AppError(status.NOT_FOUND, "Request not found");
  }

  // Check if receiver exists and is not the sender
  if (payload.receiverId === user.id) {
    throw new AppError(status.BAD_REQUEST, "You cannot send a message to yourself");
  }

  const receiver = await prisma.user.findUnique({
    where: { id: payload.receiverId },
    select: { id: true },
  });

  if (!receiver) {
    throw new AppError(status.NOT_FOUND, "Receiver not found");
  }

  // Check if both users are participants in the request
  // Either the sender or receiver should be the request creator, or both should be responders
  const isSenderRequestCreator = request.createdBy === user.id;
  const isReceiverRequestCreator = request.createdBy === payload.receiverId;

  if (!isSenderRequestCreator && !isReceiverRequestCreator) {
    // Check if both are responders to the request
    const senderResponse = await prisma.response.findFirst({
      where: { requestId: payload.requestId, userId: user.id },
    });
    const receiverResponse = await prisma.response.findFirst({
      where: { requestId: payload.requestId, userId: payload.receiverId },
    });

    if (!senderResponse || !receiverResponse) {
      throw new AppError(status.FORBIDDEN, "Both users must be participants in this request");
    }
  }

  return messageRepository.create({
    ...payload,
    senderId: user.id,
  });
};

const getMessages = async (user: TokenPayload, query: unknown) => {
  const typedQuery = parseSchema(messageListQuerySchema, query);
  const { page, limit, skip, take } = paginationUtils.getPaginationOptions(typedQuery);

  const where: MessageWhereInput = {
    OR: [{ senderId: user.id }, { receiverId: user.id }],
  };

  if (typedQuery.requestId) where.requestId = typedQuery.requestId;
  if (typedQuery.senderId) where.senderId = typedQuery.senderId;
  if (typedQuery.receiverId) where.receiverId = typedQuery.receiverId;
  if (typedQuery.isRead !== undefined) where.isRead = typedQuery.isRead;

  if (typedQuery.search) {
    const search = typedQuery.search.trim();

    where.AND = [{ message: { contains: search, mode: "insensitive" } }];
  }

  const include: MessageInclude = {
    sender: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    receiver: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    request: {
      select: {
        id: true,
        title: true,
        status: true,
      },
    },
  };

  const orderBy = paginationUtils.getOrderBy(
    typedQuery.sortBy,
    typedQuery.sortOrder,
    messageConsts.allowedSortByFields,
  );

  const [total, messages] = await Promise.all([
    messageRepository.count(where),
    messageRepository.findMany(where, skip, take, orderBy, { include }),
  ]);

  return {
    data: messages,
    meta: paginationUtils.getPaginationMeta(total, page, limit),
  };
};

const getMyMessages = async (userId: string, query: unknown) => {
  const typedQuery = parseSchema(messageListQuerySchema, query);
  const { page, limit, skip, take } = paginationUtils.getPaginationOptions(typedQuery);

  const where: MessageWhereInput = {
    OR: [{ senderId: userId }, { receiverId: userId }],
  };

  if (typedQuery.requestId) where.requestId = typedQuery.requestId;
  if (typedQuery.senderId) where.senderId = typedQuery.senderId;
  if (typedQuery.receiverId) where.receiverId = typedQuery.receiverId;
  if (typedQuery.isRead !== undefined) where.isRead = typedQuery.isRead;

  if (typedQuery.search) {
    const search = typedQuery.search.trim();
    where.AND = [{ message: { contains: search, mode: "insensitive" } }];
  }

  const orderBy = paginationUtils.getOrderBy(
    typedQuery.sortBy,
    typedQuery.sortOrder,
    messageConsts.allowedSortByFields,
  );

  const [total, messages] = await Promise.all([
    messageRepository.count(where),
    messageRepository.findMany(where, skip, take, orderBy, {
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        request: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    }),
  ]);

  return {
    data: messages,
    meta: paginationUtils.getPaginationMeta(total, page, limit),
  };
};

const getMessageById = async (messageId: string, user: TokenPayload) => {
  const message = await messageRepository.findById(messageId, {
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      request: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });

  if (!message) {
    throw new AppError(status.NOT_FOUND, "Message not found");
  }

  // Check if user is participant in the message
  if (message.senderId !== user.id && message.receiverId !== user.id) {
    throw new AppError(status.FORBIDDEN, "You are not authorized to view this message");
  }

  return message;
};

const updateMessage = async (messageId: string, userId: string, payload: UpdateMessagePayload) => {
  const message = await messageRepository.findById(messageId);

  if (!message) {
    throw new AppError(status.NOT_FOUND, "Message not found");
  }

  // Only sender can update message content, receiver can mark as read
  if (payload.message && message.senderId !== userId) {
    throw new AppError(status.FORBIDDEN, "You can only update your own messages");
  }

  if (payload.isRead && message.receiverId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You can only mark messages as read if you are the receiver",
    );
  }

  return messageRepository.updateById(messageId, payload);
};

const deleteMessage = async (messageId: string, userId: string) => {
  const message = await messageRepository.findById(messageId);

  if (!message) {
    throw new AppError(status.NOT_FOUND, "Message not found");
  }

  // Only sender can delete their message
  if (message.senderId !== userId) {
    throw new AppError(status.FORBIDDEN, "You can only delete your own messages");
  }

  return messageRepository.deleteById(messageId);
};

const getConversation = async (requestId: string, userId: string, participantId: string) => {
  // Verify both users are participants in the request
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    select: { id: true, createdBy: true },
  });

  if (!request) {
    throw new AppError(status.NOT_FOUND, "Request not found");
  }

  const isUserRequestCreator = request.createdBy === userId;
  const isParticipantRequestCreator = request.createdBy === participantId;

  if (!isUserRequestCreator && !isParticipantRequestCreator) {
    const userResponse = await prisma.response.findFirst({
      where: { requestId, userId },
    });
    const participantResponse = await prisma.response.findFirst({
      where: { requestId, userId: participantId },
    });

    if (!userResponse || !participantResponse) {
      throw new AppError(status.FORBIDDEN, "Both users must be participants in this request");
    }
  }

  return messageRepository.findByRequestAndParticipants(requestId, userId, participantId);
};

export const messageServices = {
  createMessage,
  getMessages,
  getMyMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  getConversation,
};
