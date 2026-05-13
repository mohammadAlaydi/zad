export type ErrorMeta = Readonly<Record<string, unknown>>;

export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(
    message: string,
    public readonly meta?: ErrorMeta,
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON(): { code: string; message: string; meta?: ErrorMeta } {
    return this.meta === undefined
      ? { code: this.code, message: this.message }
      : { code: this.code, message: this.message, meta: this.meta };
  }
}

// `code` typed as `string` (not the literal) so per-module subclasses can
// narrow it (e.g. `IDENTITY.INVALID_CREDENTIALS`) — see ADR-0009.
export class ValidationError extends AppError {
  readonly code: string = "COMMON.VALIDATION";
  readonly httpStatus = 400;
}

export class UnauthorizedError extends AppError {
  readonly code: string = "COMMON.UNAUTHORIZED";
  readonly httpStatus = 401;
}

export class ForbiddenError extends AppError {
  readonly code: string = "COMMON.FORBIDDEN";
  readonly httpStatus = 403;
}

export class NotFoundError extends AppError {
  readonly code: string = "COMMON.NOT_FOUND";
  readonly httpStatus = 404;
}

export class ConflictError extends AppError {
  readonly code: string = "COMMON.CONFLICT";
  readonly httpStatus = 409;
}

export class UnprocessableError extends AppError {
  readonly code: string = "COMMON.UNPROCESSABLE";
  readonly httpStatus = 422;
}

export class RateLimitedError extends AppError {
  readonly code: string = "COMMON.RATE_LIMITED";
  readonly httpStatus = 429;
}

export class InternalError extends AppError {
  readonly code: string = "COMMON.INTERNAL";
  readonly httpStatus = 500;
}
