import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import heCommon from "./locales/he/common.json";
import enCommon from "./locales/en/common.json";
import heHome from "./locales/he/home.json";
import enHome from "./locales/en/home.json";
import heFaq from "./locales/he/faq.json";
import enFaq from "./locales/en/faq.json";

/**
 * Two languages, so both catalogues are imported eagerly rather than fetched.
 * They are a few KB each; an HTTP backend would add a network round trip and a
 * flash of untranslated keys to save nothing.
 *
 * Language is decided by the URL, not by a detector: `/en/...` is English and
 * everything else is Hebrew. That keeps the URL the single source of truth, so
 * a shared link always opens in the language it was written in — and it matches
 * what `index.html` reads to set `dir` before React mounts.
 */
export const SUPPORTED_LANGUAGES = ["he", "en"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "he";

/** Language names in their own script — never "Hebrew"/"HE". */
export const LANGUAGE_LABELS: Record<Language, string> = {
  he: "עברית",
  en: "English",
};

export const LANGUAGE_DIR: Record<Language, "rtl" | "ltr"> = {
  he: "rtl",
  en: "ltr",
};

/** The language a pathname belongs to. `/en` and `/en/...` are English. */
export function languageFromPath(pathname: string): Language {
  return /^\/en(\/|$)/.test(pathname) ? "en" : "he";
}

i18n.use(initReactI18next).init({
  resources: {
    he: { common: heCommon, home: heHome, faq: heFaq },
    en: { common: enCommon, home: enHome, faq: enFaq },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: "common",
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
});

export default i18n;
