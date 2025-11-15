export const buildPaginatedListResponse = <T>(items: T[], page: number, limit: number, total: number) => {
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
        success: true,
        data: items,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
};