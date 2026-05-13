// Mirrors the AppError response shape the api emits (see
// apps/api/src/shared/errors/handler.ts). Mobile reads .code and maps to
// i18n strings; never to user-visible message directly.

export interface ApiErrorPayload {
  code: string;
  message: string;
  requestId?: string;
  meta?: Record<string, unknown>;
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly httpStatus: number,
    message: string,
    public readonly requestId?: string,
    public readonly meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static fromPayload(httpStatus: number, payload: ApiErrorPayload): ApiError {
    return new ApiError(payload.code, httpStatus, payload.message, payload.requestId, payload.meta);
  }
}

export class NetworkError extends Error {
  readonly code = "CLIENT.NETWORK";
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ResponseShapeError extends Error {
  readonly code = "CLIENT.RESPONSE_SHAPE";
  constructor(message: string) {
    super(message);
    this.name = "ResponseShapeError";
  }
}

export type ClientError = ApiError | NetworkError | ResponseShapeError;
