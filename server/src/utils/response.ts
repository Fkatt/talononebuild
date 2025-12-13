// Standardized API Response Wrapper
// All endpoints MUST use this wrapper for consistency

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

export const successResponse = <T>(data: T): ApiSuccessResponse<T> => {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const errorResponse = (
  code: string,
  message: string,
  details?: any
): ApiErrorResponse => {
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

// Common error codes
export const ErrorCodes = {
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
