import { prisma } from "@/app/lib/prisma";
import type { RequestInclude, RequestSelect, RequestWhereInput } from "@/generated/prisma/models";

type RequestRepoOptions = {
  select?: RequestSelect;
  include?: RequestInclude;
};

const create = (data: any) => {
  return prisma.request.create({ data });
};

const count = (where: RequestWhereInput) => {
  return prisma.request.count({ where });
};

const findMany = (
  where: RequestWhereInput,
  skip: number,
  take: number,
  orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" },
  options?: RequestRepoOptions,
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

  return prisma.request.findMany(query as any);
};

const findById = (id: string, options?: RequestRepoOptions) => {
  const query: Record<string, unknown> = {
    where: { id },
  };

  if (options?.select) {
    query.select = options.select;
  } else if (options?.include) {
    query.include = options.include;
  }

  return prisma.request.findUnique(query as any);
};

const update = (id: string, data: any) => {
  return prisma.request.update({
    where: { id },
    data,
  });
};

const remove = (id: string) => {
  return prisma.request.delete({ where: { id } });
};

export const requestRepository = {
  create,
  count,
  findMany,
  findById,
  update,
  delete: remove,
};
