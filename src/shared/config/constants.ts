export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503
} as const;

export const ERROR_MESSAGES = {
    VALIDATION_ERROR: "Validation error",
    TOO_MANY_REQUESTS: "Too Many Requests",
    NOT_FOUND: "Resource not found",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Forbidden access",
    CONFLICT: "Resource already exists",
    INTERNAL_ERROR: "Internal server error",
    DATABASE_ERROR: "Database error",
    INVALID_ID: "Invalid ID format",
    MISSING_FIELDS: "Missing required fields",
    INVALID_DATA: "Invalid data provided"
} as const;