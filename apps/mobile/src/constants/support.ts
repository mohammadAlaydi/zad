// Support / company contact info. Single source of truth so updates in
// one place propagate everywhere (help screen, WhatsApp bot banner,
// about page). Phone numbers are intentionally NOT prefilled with a
// vanity-style placeholder anymore — if a value is empty, screens hide
// that channel rather than print a fake number to the user.
export const SUPPORT = {
  email: "support@zadpay.com",
  // Set this to the production WhatsApp bot number when it goes live.
  whatsappBotNumber: "",
} as const;
