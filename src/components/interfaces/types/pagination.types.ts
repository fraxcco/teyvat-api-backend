export interface MongoPaginationOptions<TSort extends string> {
    page: number;
    limit: number;
    sortBy: TSort;
    sortOrder: "asc" | "desc";
    secondarySort?: TSort;
}

export interface MongoPaginationResult {
    skip: number;
    limit: number;
    sort: Record<string, 1 | -1>;
}

export interface PaginationQueryParams {
    page?: number | string;
    limit?: number | string;
    sortBy?: string;
    sortOrder?: string;
}

export interface PaginationOptions<TAllowed extends string> {
    allowedSortFields: ReadonlyArray<TAllowed>;
    defaultSortBy: TAllowed;
}

export interface NormalizedPagination<TAllowed extends string> {
    page: number;
    limit: number;
    sortBy: TAllowed;
    sortOrder: "asc" | "desc";
}