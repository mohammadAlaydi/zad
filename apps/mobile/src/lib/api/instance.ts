// Singleton API client. Auth hooks are wired by src/features/auth/store
// at app boot so we avoid the circular dependency (auth uses the client;
// the client uses auth state).

import { config } from "../config/index";
import { ApiClient } from "./client";

export const api = new ApiClient(config.apiBaseUrl);
