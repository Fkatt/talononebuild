"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = exports.errorResponse = exports.successResponse = void 0;
const successResponse = (data) => {
    return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
    };
};
exports.successResponse = successResponse;
const errorResponse = (code, message, details) => {
    return {
        success: false,
        error: {
            code,
            message,
            details,
        },
        timestamp: new Date().toISOString(),
    };
};
exports.errorResponse = errorResponse;
exports.ErrorCodes = {
    AUTH_FAILED: 'AUTH_FAILED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    CONNECTION_TEST_FAILED: 'CONNECTION_TEST_FAILED',
    MIGRATION_ERROR: 'MIGRATION_ERROR',
    DEPENDENCY_MISSING: 'DEPENDENCY_MISSING',
    SCHEMA_MISMATCH: 'SCHEMA_MISMATCH',
};
//# sourceMappingURL=response.js.map