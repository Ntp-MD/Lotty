export interface ApiError {
  statusCode: number;
  message: string;
  code?: string;
  details?: unknown;
}

export function createApiError(statusCode: number, message: string, code?: string, details?: unknown): ApiError {
  return {
    statusCode,
    message,
    code,
    details,
  };
}

export function handleDatabaseError(error: { message: string; code?: string }): never {
  throw createError({
    statusCode: 500,
    message: `Database error: ${error.message}`,
    data: { code: error.code },
  });
}

export function handleValidationError(message: string): never {
  throw createError({
    statusCode: 400,
    message: `Validation error: ${message}`,
  });
}

export function handleNotFoundError(resource: string): never {
  throw createError({
    statusCode: 404,
    message: `${resource} not found`,
  });
}

export function handleUnauthorizedError(message = "Unauthorized"): never {
  throw createError({
    statusCode: 401,
    message,
  });
}
