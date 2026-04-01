/**
 * Shared pagination parser and response builder.
 */

export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/**
 * Parses page/limit from query params with safe defaults and bounds.
 */
export function parsePagination(query: { page?: string; limit?: string }, defaultLimit = 20): PaginationParams {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || defaultLimit));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}

/**
 * Builds pagination metadata for response.
 */
export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
}
