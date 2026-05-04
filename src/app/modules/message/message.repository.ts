import { prisma } from "@/app/lib/prisma";
import type { MessageInclude, MessageSelect, MessageWhereInput } from "@/generated/prisma/models";

type MessageRepoOptions = {
  select?: MessageSelect;
  include?: MessageInclude;
};

const create = (data: any) => {
  return prisma.message.create({ data });
};

const count = (where: MessageWhereInput) => {
  return prisma.message.count({ where });
};

const findMany = (
  where: MessageWhereInput,
  skip: number,
  take: number,
  orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" },
  options?: MessageRepoOptions,
) => {
  const query: Record<string, unknown> = {
    where,
    skip,
    take,
    orderBy,
  };

  if (options?.select) {
    query.select = options.select;
  } else if (options?.include) {
    query.include = options.include;
  }

  return prisma.message.findMany(query as any);
};

const findById = (id: string, options?: MessageRepoOptions) => {
  const query: Record<string, unknown> = {
    where: { id },
  };

  if (options?.select) {
    query.select = options.select;
  } else if (options?.include) {
    query.include = options.include;
  }

  return prisma.message.findUnique(query as any);
};

const updateById = (id: string, data: any, options?: MessageRepoOptions) => {
  const query: Record<string, unknown> = {
    where: { id },
    data,
  };

  if (options?.select) {
    query.select = options.select;
  } else if (options?.include) {
    query.include = options.include;
  }

  return prisma.message.update(query as any);
};

const deleteById = (id: string) => {
  return prisma.message.delete({
    where: { id },
  });
};

const findByRequestAndParticipants = (requestId: string, userId: string, participantId: string) => {
  return prisma.message.findMany({
    where: {
      requestId: requestId,
      OR: [
        {
          senderId: userId,
          receiverId: participantId,
        },
        {
          senderId: participantId,
          receiverId: userId,
        },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      receiver: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });
};

export const messageRepository = {
  create,
  count,
  findMany,
  findById,
  updateById,
  deleteById,
  findByRequestAndParticipants,
};
