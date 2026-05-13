import type { Currency } from "@/store/appStore";

/**
 * Emoji flags for every supported currency.
 * Single source of truth — import this everywhere instead of
 * defining local `FLAGS` / `CURRENCY_FLAGS` objects.
 */
export const CURRENCY_FLAGS: Record<Currency, string> = {
  USD: "🇺🇸",
  AED: "🇦🇪",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
};
