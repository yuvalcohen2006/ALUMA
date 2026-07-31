import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { languageFromPath, type Language } from "@/i18n";

/** Strip a leading `/en` so a path can be re-prefixed for another language. */
export function stripLanguagePrefix(pathname: string): string {
  const stripped = pathname.replace(/^\/en(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

/**
 * Prefix an app path with the language segment.
 *
 * Hebrew is the default language and lives at the root, so it takes no prefix —
 * `/collections` stays `/collections` and only English becomes
 * `/en/collections`. External links (http…, mailto:, tel:, #…) pass through
 * untouched.
 */
export function localizePath(path: string, lang: Language): string {
  if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(path)) return path;
  const clean = stripLanguagePrefix(path.startsWith("/") ? path : `/${path}`);
  if (lang === "he") return clean;
  return clean === "/" ? "/en" : `/en${clean}`;
}

/**
 * `to()` localises a path for the language currently in the URL, so links keep
 * visitors inside the language they are reading.
 */
export function useLocalizedPath() {
  const { pathname } = useLocation();
  const lang = languageFromPath(pathname);

  const to = useCallback((path: string) => localizePath(path, lang), [lang]);

  return { lang, to, stripLanguagePrefix };
}
