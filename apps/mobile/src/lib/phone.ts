// Phone validation tied to the country picker.
//
// The user picks a country from the flag dropdown — the entered digits must
// then be a valid national number for that country. We normalise to E.164
// (`+<dial><national>`) before sending to the backend; the backend
// re-validates so a tampered client can't bypass these rules.

import {
  AsYouType,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

export type PhoneCheck =
  | { ok: true; e164: string }
  | { ok: false; reason: "too_short" | "too_long" | "invalid_for_country" };

// Validate the user-typed national digits against the picked country.
// `national` is digits only (no `+`, no dial code). Returns the canonical
// E.164 string on success.
export function validatePhone(national: string, country: string): PhoneCheck {
  const digits = national.replace(/\D/g, "");
  if (digits.length === 0) return { ok: false, reason: "too_short" };

  const cc = country.toUpperCase() as CountryCode;
  const dial = safeDialCode(cc);
  if (dial === null) return { ok: false, reason: "invalid_for_country" };

  const candidate = `+${dial}${digits}`;
  const parsed = parsePhoneNumberFromString(candidate, cc);
  if (parsed === undefined) return { ok: false, reason: "invalid_for_country" };
  if (parsed.country !== cc) return { ok: false, reason: "invalid_for_country" };

  // `isValid` covers both length and the country's specific area-code rules.
  // `isPossible` is a cheaper length-only check; we use it to distinguish
  // "you haven't typed enough" from "this number doesn't exist".
  if (!parsed.isPossible()) {
    const max = getMaxNationalLength(country);
    return { ok: false, reason: digits.length < max ? "too_short" : "too_long" };
  }
  if (!parsed.isValid()) return { ok: false, reason: "invalid_for_country" };

  return { ok: true, e164: parsed.number };
}

// Upper bound on national digits for a given country — used by PhoneInput
// to cap `maxLength` on the TextInput so the user can't even type past the
// allowed length.
export function getMaxNationalLength(country: string): number {
  // libphonenumber-js doesn't expose a "max possible length" API directly;
  // these are the largest documented lengths for the picker's 8 countries.
  // If you add more countries to data/countries.ts, add an entry here.
  const map: Record<string, number> = {
    AE: 9,
    SA: 9,
    EG: 10,
    IQ: 10,
    US: 10,
    GB: 10,
    BD: 10,
    JO: 9,
  };
  return map[country.toUpperCase()] ?? 15;
}

// Used by PhoneInput to format as-you-type with the right country spacing.
export function formatAsYouType(national: string, country: string): string {
  const formatter = new AsYouType(country.toUpperCase() as CountryCode);
  return formatter.input(national.replace(/\D/g, ""));
}

function safeDialCode(country: CountryCode): string | null {
  try {
    return getCountryCallingCode(country);
  } catch {
    return null;
  }
}

// ── Back-compat shims ─────────────────────────────────────────────────
// Older code imported these names; keep them so we don't break unrelated
// call sites in this change. Both just trim — strict validation now lives
// in `validatePhone`.

export function normalizePhone(input: string): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export const normalizePhoneToE164 = normalizePhone;
