export const CURRENCIES = [
  "USD",
  "AED",
  "CAD",
  "AUD",
  "EUR",
  "GBP",
  "SAR",
  "KWD",
  "BHD",
  "OMR",
  "JOD",
  "JPY",
] as const;

export type Currency = (typeof CURRENCIES)[number];

export function minorUnitsFor(currency: Currency): number {
  switch (currency) {
    case "USD":
    case "AED":
    case "CAD":
    case "AUD":
    case "EUR":
    case "GBP":
    case "SAR":
      return 2;
    case "KWD":
    case "BHD":
    case "OMR":
    case "JOD":
      return 3;
    case "JPY":
      return 0;
  }
}

export function isCurrency(v: unknown): v is Currency {
  return typeof v === "string" && (CURRENCIES as readonly string[]).includes(v);
}
