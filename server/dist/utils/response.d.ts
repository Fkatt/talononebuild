export interface ApiSuccessResponse<T = any> {
    success: true;
    data: T;
    timestamp: string;
}
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
}
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
export declare const successResponse: <T>(data: T) => ApiSuccessResponse<T>;
export declare const errorResponse: (code: string, message: string, details?: any) => ApiErrorResponse;
export declare const ErrorCodes: {
    AUTH_FAILED: string;
    INVALID_CREDENTIALS: string;
    TOKEN_EXPIRED: string;
    UNAUTHORIZED: string;
    FORBIDDEN: string;
    NOT_FOUND: string;
    VALIDATION_ERROR: string;
    INTERNAL_ERROR: string;
    CONNECTION_TEST_FAILED: string;
    MIGRATION_ERROR: string;
    DEPENDENCY_MISSING: string;
    SCHEMA_MISMATCH: string;
};
//# sourceMappingURL=response.d.ts.map