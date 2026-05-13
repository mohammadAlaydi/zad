export type Country = { code: string; dial: string; flag: string; name: string };

export const COUNTRIES: Country[] = [
  { code: "AE", dial: "+971", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "SA", dial: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "EG", dial: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "IQ", dial: "+964", flag: "🇮🇶", name: "Iraq" },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "United States" },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "BD", dial: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "JO", dial: "+962", flag: "🇯🇴", name: "Jordan" },
];

export const CURRENCIES = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", symbol: "$" },
  { code: "AED", name: "United Arab Emirates Dirham", flag: "🇦🇪", symbol: "د.إ" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", symbol: "A$" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", symbol: "£" },
  { code: "EUR", name: "Euro", flag: "🇪🇺", symbol: "€" },
];
