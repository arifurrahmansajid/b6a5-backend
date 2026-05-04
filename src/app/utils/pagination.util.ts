import { parseSchema } from "@/app/utils/zod-error.util";
import { z } from "zod";

type SortOrder = "asc" | "desc";

interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const optionalPositiveIntFromQuery = z.preprocess((val) => {
  if (val === undefined || val === "") return undefined;
  return Number(val);
}, z.number().int().positive().optional());

export const paginationQuerySchema = z.object({
  page: optionalPositiveIntFromQuery,
  limit: optionalPositiveIntFromQuery,
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;

const parsePaginationQuery = (query: unknown): PaginationQueryInput => {
  return parseSchema(paginationQuerySchema, query);
};

const normalizePage = (page?: number): number => {
  if (typeof page === "number" && Number.isInteger(page) && page > 0) {
    return page;
  }

  return DEFAULT_PAGE;
};

const normalizeLimit = (limit?: number): number => {
  if (typeof limit === "number" && Number.isInteger(limit) && limit > 0) {
    return Math.min(limit, MAX_LIMIT);
  }

  return DEFAULT_LIMIT;
};

const getPaginationOptions = (query: unknown): PaginationOptions => {
  const { page, limit } = parsePaginationQuery(query);
  const normalizedPage = normalizePage(page);
  const normalizedLimit = normalizeLimit(limit);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
    take: normalizedLimit,
  };
};

const getPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
  };
};

const getOrderBy = <T extends string>(
  sortBy: string | undefined,
  sortOrder: SortOrder | undefined,
  allowedFields: readonly T[],
): Record<T, SortOrder> => {
  const selectedField =
    typeof sortBy === "string" && allowedFields.includes(sortBy as T) ? (sortBy as T) : "createdAt";

  const normalizedOrder: SortOrder = sortOrder === "asc" ? "asc" : "desc";

  return { [selectedField]: normalizedOrder } as Record<T, SortOrder>;
};

export const paginationUtils = {
  getPaginationOptions,
  getPaginationMeta,
  getOrderBy,
  normalizePage,
  normalizeLimit,
  paginationQuerySchema,
};
