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

export class ValidationError extends AppError {
  readonly code = "COMMON.VALIDATION";
  readonly httpStatus = 400;
}

export class UnauthorizedError extends AppError {
  readonly code = "COMMON.UNAUTHORIZED";
  readonly httpStatus = 401;
}

export class ForbiddenError extends AppError {
  readonly code = "COMMON.FORBIDDEN";
  readonly httpStatus = 403;
}

export class NotFoundError extends AppError {
  readonly code = "COMMON.NOT_FOUND";
  readonly httpStatus = 404;
}

export class ConflictError extends AppError {
  readonly code = "COMMON.CONFLICT";
  readonly httpStatus = 409;
}

export class UnprocessableError extends AppError {
  readonly code = "COMMON.UNPROCESSABLE";
  readonly httpStatus = 422;
}

export class RateLimitedError extends AppError {
  readonly code = "COMMON.RATE_LIMITED";
  readonly httpStatus = 429;
}

export class InternalError extends AppError {
  readonly code = "COMMON.INTERNAL";
  readonly httpStatus = 500;
}
