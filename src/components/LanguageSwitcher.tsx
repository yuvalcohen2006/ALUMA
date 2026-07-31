import { Globe } from "lucide-react";
import { useLocation } from "react-router-dom";
import { LANGUAGE_LABELS, languageFromPath, type Language } from "@/i18n";
import { localizePath } from "@/lib/useLocalizedPath";

/**
 * Language switcher: a globe and the name of the language you'd switch TO,
 * written in its own script.
 *
 * No flags. A flag is a country, not a language — there is no correct flag for
 * English, and an Israeli flag beside "עברית" reads badly for Arabic-speaking
 * Israeli customers. The globe is the convention every serious multilingual
 * site has converged on.
 *
 * Rendered as a real <a href>, not a button, so it is crawlable, gets an
 * hreflang, and middle-clicks into a new tab like any other link. The href
 * points at the SAME page in the other language, so switching never dumps the
 * visitor back on the home page.
 */
const LanguageSwitcher = ({ className = "" }: { className?: string }) => {
  const { pathname, search, hash } = useLocation();
  const current = languageFromPath(pathname);
  const other: Language = current === "he" ? "en" : "he";
  const href = localizePath(pathname, other) + search + hash;

  return (
    <a
      href={href}
      hrefLang={other}
      lang={other}
      // 44px minimum hit area, per touch-target guidance — the visible chip is
      // smaller, the padding makes up the difference.
      className={`inline-flex items-center gap-2 min-h-[44px] px-3 text-[15px] text-foreground/80 hover:text-accent transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className}`}
      aria-label={
        other === "en" ? "Switch to English" : "מעבר לעברית"
      }
    >
      <Globe className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} aria-hidden="true" />
      <span>{LANGUAGE_LABELS[other]}</span>
    </a>
  );
};

export default LanguageSwitcher;
