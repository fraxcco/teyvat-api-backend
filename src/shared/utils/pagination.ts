import { CustomError } from "../../infrastructure/middleware/errorHandler";
import { MongoPaginationOptions, MongoPaginationResult, PaginationOptions, PaginationQueryParams, NormalizedPagination } from "../../components/interfaces/types/pagination.types";
import { HTTP_STATUS, environment } from "../config/";
const SORT_ORDERS = new Set(["asc", "desc"]);

export const normalizePaginationQuery = <TAllowed extends string>(query: PaginationQueryParams, { allowedSortFields, defaultSortBy }: PaginationOptions<TAllowed>): NormalizedPagination<TAllowed> => {
    const defaultPageSize = environment?.DEFAULT_PAGE_SIZE ?? 10;
    const maxPageSize = environment?.MAX_PAGE_SIZE ?? 100;

    const rawPage = Number(query.page);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

    const rawLimit = Number(query.limit);
    const normalizedLimit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : defaultPageSize;
    const limit = Math.min(maxPageSize, normalizedLimit);

    const allowedSort = new Set<TAllowed>(allowedSortFields);
    const sortByCandidate = typeof query.sortBy === "string" && query.sortBy.trim().length > 0 ? (query.sortBy.trim() as TAllowed) : defaultSortBy;

    if(!allowedSort.has(sortByCandidate)) {
        throw new CustomError(`Invalid sort field: ${sortByCandidate}`, HTTP_STATUS.BAD_REQUEST);
    }

    const sortOrderRaw = (query.sortOrder ?? "asc").toString().toLowerCase();

    if(query.sortOrder && !SORT_ORDERS.has(sortOrderRaw)) {
        throw new CustomError(`Invalid sort order: ${query.sortOrder}`, HTTP_STATUS.BAD_REQUEST);
    }

    const sortOrder = (SORT_ORDERS.has(sortOrderRaw) ? sortOrderRaw : "asc") as "asc" | "desc";

    return { page, limit, sortBy: sortByCandidate, sortOrder };
};

export const buildMongoPagination = <TSort extends string>({ page, limit, sortBy, sortOrder, secondarySort }: MongoPaginationOptions<TSort>): MongoPaginationResult => {
    const direction = sortOrder === "desc" ? -1 : 1;
    const sort: Record<string, 1 | -1> = { [sortBy]: direction };

    if(secondarySort && secondarySort !== sortBy) {
        sort[secondarySort] = 1;
    }

    return { skip: (page - 1) * limit, limit, sort };
};