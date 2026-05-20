// Phone normalisation helper.
//
// In dev we deliberately accept whatever the user types and only trim
// whitespace. The DB stores the string as-is and uses byte-equality to
// match accounts; the same value must be used at signup, login, and
// recipient lookup.
//
// When SMS verification + strict E.164 is wired, this is the single
// place to enforce it — every screen that touches a phone field calls
// through here.

export function normalizePhone(input: string): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  return trimmed.length === 0 ? null : trimmed;
}

// Compatibility shim — older code still imports this name. Permissive
// behaviour matches normalizePhone for now.
export const normalizePhoneToE164 = normalizePhone;
