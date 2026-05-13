// Public surface of the auth feature. Other features and screens import
// only from here — ESLint enforces it (no-restricted-imports for
// `features/auth/{components,hooks,services,store}/*`).

export { bootstrapAuth } from "./bootstrap";
export { useAuthSession } from "./hooks/useAuthSession";
export { useLogin, type UseLoginResult } from "./hooks/useLogin";
export { useRegister, type UseRegisterResult } from "./hooks/useRegister";
export { useLogout } from "./hooks/useLogout";
export type { AuthSession } from "./store/authStore";
