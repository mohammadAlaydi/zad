// The phone-based signup/login UI sends digits + a password. The backend
// identity module only knows about email + password, so we deterministically
// derive a synthetic email from the phone digits. Same digits → same email,
// so the same user can log back in later.
export function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 0) return "";
  return `${digits}@phone.zadpay.local`;
}
