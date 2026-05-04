import { prisma } from "@/app/lib/prisma";
import type {
  ResponseFindUniqueArgs,
  ResponseInclude,
  ResponseSelect,
  ResponseWhereInput,
} from "@/generated/prisma/models";

type ResponseRepoOptions = {
  select?: ResponseSelect;
  include?: ResponseInclude;
};

const create = (data: any) => {
  return prisma.response.create({ data });
};

const count = (where: ResponseWhereInput) => {
  return prisma.response.count({ where });
};

const findMany = (
  where: ResponseWhereInput,
  skip: number,
  take: number,
  orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" },
  options?: ResponseRepoOptions,
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

  return prisma.response.findMany(query as any);
};

const findById = (id: string, options?: ResponseRepoOptions) => {
  const query: Record<string, unknown> = {
    where: { id },
  };

  if (options?.select) {
    query.select = options.select;
  } else if (options?.include) {
    query.include = options.include;
  }

  return prisma.response.findUnique(query as any);
};

export const findByRequestAndUser = (
  requestId: string,
  userId: string,
  options?: ResponseRepoOptions,
) => {
  const query: ResponseFindUniqueArgs = {
    where: {
      requestId_userId: {
        requestId,
        userId,
      },
    },
  };

  if (options?.select) {
    query.select = options.select;
  } else if (options?.include) {
    query.include = options.include;
  }

  return prisma.response.findUnique(query);
};

const update = (id: string, data: any) => {
  return prisma.response.update({
    where: { id },
    data,
  });
};

const remove = (id: string) => {
  return prisma.response.delete({ where: { id } });
};

export const responseRepository = {
  create,
  count,
  findMany,
  findById,
  findByRequestAndUser,
  update,
  delete: remove,
};
