import { type Result } from "@zadpay/errors";
import {
  LoginRequestSchema,
  RefreshRequestSchema,
  RegisterRequestSchema,
  TokenPairResponseSchema,
  MeResponseSchema,
  type LoginRequest,
  type MeResponse,
  type RegisterRequest,
  type TokenPairResponse,
} from "@zadpay/validation";
import { type ClientError } from "@/lib/api/errors";
import { api } from "@/lib/api/instance";

// Thin wrapper over the api client. Service functions encode the contract
// (path + method + schema) once; hooks/components call into the service
// rather than `api.post(...)` directly.
export const authService = {
  async login(input: LoginRequest): Promise<Result<TokenPairResponse, ClientError>> {
    LoginRequestSchema.parse(input); // catch caller mistakes early
    return api.post<TokenPairResponse>("/v1/auth/login", input, TokenPairResponseSchema, {
      skipAuth: true,
    });
  },

  async register(input: RegisterRequest): Promise<Result<TokenPairResponse, ClientError>> {
    RegisterRequestSchema.parse(input);
    return api.post<TokenPairResponse>("/v1/auth/register", input, TokenPairResponseSchema, {
      skipAuth: true,
    });
  },

  // Used by the api client's refresh interceptor — `skipRefresh: true` so a
  // 401 here never recurses.
  async refresh(refreshToken: string): Promise<Result<TokenPairResponse, ClientError>> {
    RefreshRequestSchema.parse({ refreshToken });
    return api.post<TokenPairResponse>(
      "/v1/auth/refresh",
      { refreshToken },
      TokenPairResponseSchema,
      { skipAuth: true, skipRefresh: true },
    );
  },

  async logout(refreshToken: string): Promise<Result<void, ClientError>> {
    return api.postVoid("/v1/auth/logout", { refreshToken }, { skipAuth: true });
  },

  async me(): Promise<Result<MeResponse, ClientError>> {
    return api.get<MeResponse>("/v1/identity/me", MeResponseSchema);
  },
};
