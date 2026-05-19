import { err, ok, type Result } from "@zadpay/errors";
import type { ZodTypeAny } from "zod";
import { ApiError, NetworkError, ResponseShapeError, type ClientError } from "./errors";

// Non-crypto correlator; the server logs it via the request-context plugin.
function makeRequestId(): string {
  const a = Math.random().toString(36).slice(2, 10);
  const b = Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${a}-${b}`;
}

// Hooks the client uses to integrate with the auth feature without
// importing it (avoids circular deps; the auth feature wires these in at
// boot via `setApiAuthHooks`).
export interface ApiAuthHooks {
  getAccessToken: () => string | null;
  /** Returns true on success. Mutates the auth state internally. */
  refresh: () => Promise<boolean>;
  onSessionLost: () => void;
}

export interface ApiRequestOptions {
  /** Idempotency-Key header value. Required for state-changing endpoints. */
  idempotencyKey?: string;
  /** Skip auth (e.g. /v1/auth/login). */
  skipAuth?: boolean;
  /** Skip the refresh-on-401 interceptor (e.g. inside refresh itself). */
  skipRefresh?: boolean;
}

export class ApiClient {
  private hooks: ApiAuthHooks = {
    getAccessToken: () => null,
    refresh: async () => false,
    onSessionLost: () => {},
  };
  private refreshInFlight: Promise<boolean> | null = null;

  constructor(private readonly baseUrl: string) {}

  setAuthHooks(hooks: ApiAuthHooks): void {
    this.hooks = hooks;
  }

  get<T>(
    path: string,
    schema: ZodTypeAny,
    opts?: ApiRequestOptions,
  ): Promise<Result<T, ClientError>> {
    return this.request<T>("GET", path, undefined, schema, opts);
  }
  post<T>(
    path: string,
    body: unknown,
    schema: ZodTypeAny,
    opts?: ApiRequestOptions,
  ): Promise<Result<T, ClientError>> {
    return this.request<T>("POST", path, body, schema, opts);
  }
  put<T>(
    path: string,
    body: unknown,
    schema: ZodTypeAny,
    opts?: ApiRequestOptions,
  ): Promise<Result<T, ClientError>> {
    return this.request<T>("PUT", path, body, schema, opts);
  }
  delete<T>(
    path: string,
    schema: ZodTypeAny,
    opts?: ApiRequestOptions,
  ): Promise<Result<T, ClientError>> {
    return this.request<T>("DELETE", path, undefined, schema, opts);
  }
  // 204 No Content — no schema, no body.
  async postVoid(
    path: string,
    body: unknown,
    opts?: ApiRequestOptions,
  ): Promise<Result<void, ClientError>> {
    const response = await this.doFetch("POST", path, body, opts);
    if (response instanceof Error) return err(response);
    if (response.status >= 200 && response.status < 300) return ok(undefined);
    return err(await this.toApiError(response));
  }

  async deleteVoid(path: string, opts?: ApiRequestOptions): Promise<Result<void, ClientError>> {
    const response = await this.doFetch("DELETE", path, undefined, opts);
    if (response instanceof Error) return err(response);
    if (response.status >= 200 && response.status < 300) return ok(undefined);
    return err(await this.toApiError(response));
  }

  private async request<T>(
    method: string,
    path: string,
    body: unknown,
    schema: ZodTypeAny,
    opts?: ApiRequestOptions,
  ): Promise<Result<T, ClientError>> {
    let response = await this.doFetch(method, path, body, opts);
    if (response instanceof Error) return err(response);

    // 401 → try refresh once, then retry. Skipped when called inside refresh.
    if (response.status === 401 && opts?.skipRefresh !== true && opts?.skipAuth !== true) {
      const refreshed = await this.singleFlightRefresh();
      if (!refreshed) {
        this.hooks.onSessionLost();
        return err(await this.toApiError(response));
      }
      response = await this.doFetch(method, path, body, opts);
      if (response instanceof Error) return err(response);
    }

    if (response.status >= 200 && response.status < 300) {
      try {
        const json: unknown = await response.json();
        const parsed = schema.safeParse(json);
        if (!parsed.success) {
          return err(new ResponseShapeError(`Invalid response shape for ${method} ${path}`));
        }
        return ok(parsed.data as T);
      } catch (e) {
        return err(
          new ResponseShapeError(`Response was not valid JSON for ${method} ${path}: ${String(e)}`),
        );
      }
    }
    return err(await this.toApiError(response));
  }

  private async doFetch(
    method: string,
    path: string,
    body: unknown,
    opts: ApiRequestOptions | undefined,
  ): Promise<Response | NetworkError> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "x-request-id": makeRequestId(),
    };
    // Only declare a JSON content-type when there's actually a body —
    // Fastify rejects requests that advertise application/json with no
    // payload (FST_ERR_CTP_EMPTY_JSON_BODY).
    if (body !== undefined) {
      headers["content-type"] = "application/json";
    }
    if (opts?.skipAuth !== true) {
      const token = this.hooks.getAccessToken();
      if (token !== null) headers["authorization"] = `Bearer ${token}`;
    }
    if (opts?.idempotencyKey !== undefined) {
      headers["idempotency-key"] = opts.idempotencyKey;
    }
    try {
      return await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (e) {
      return new NetworkError(e instanceof Error ? e.message : String(e));
    }
  }

  private async singleFlightRefresh(): Promise<boolean> {
    this.refreshInFlight ??= this.hooks.refresh();
    try {
      return await this.refreshInFlight;
    } finally {
      this.refreshInFlight = null;
    }
  }

  private async toApiError(response: Response): Promise<ApiError> {
    try {
      const payload: unknown = await response.json();
      if (
        typeof payload === "object" &&
        payload !== null &&
        "code" in payload &&
        "message" in payload
      ) {
        const p = payload as {
          code: string;
          message: string;
          requestId?: string;
          meta?: Record<string, unknown>;
        };
        return ApiError.fromPayload(response.status, p);
      }
    } catch {
      // fall through
    }
    return new ApiError(
      "CLIENT.UNKNOWN",
      response.status,
      `Request failed with status ${String(response.status)}`,
    );
  }
}
