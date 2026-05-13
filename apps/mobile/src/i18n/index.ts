import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { I18nManager } from "react-native";
import en from "./en";
import ar from "./ar";

export const SUPPORTED_LOCALES = ["en", "ar"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

const deviceLocale = (Localization.getLocales()[0]?.languageCode ?? "en") as Locale;
const initial: Locale = SUPPORTED_LOCALES.includes(deviceLocale) ? deviceLocale : "en";

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: initial,
  fallbackLng: "en",
  compatibilityJSON: "v3",
  interpolation: { escapeValue: false },
});

export function setLocale(locale: Locale) {
  const isRTL = locale === "ar";
  i18n.changeLanguage(locale);
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }
}

export default i18n;
