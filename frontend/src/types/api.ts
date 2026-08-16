export interface ApiSuccess<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

/** Useful for list endpoints */
export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}