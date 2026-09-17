import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, languageFromPath, type Language } from "@/i18n";
import { localizePath } from "@/lib/useLocalizedPath";
import israelFlag from "@/assets/flags/israel.svg";
import unitedStatesFlag from "@/assets/flags/united-states.svg";

/**
 * The language control: a button naming the language you are reading, opening
 * a menu with one row per language, the current one ticked.
 *
 * It was a single link to "the other language" — correct, and invisible. A
 * visitor scanning for a language control looks for a control, not for the
 * word "English" sitting in a row of navigation items, and a two-language
 * toggle gives no clue what the site is offering until you read it.
 *
 * WHY THE ROWS ARE LINKS. Each row is a real <a href> at the same page in that
 * language, so it keeps its hreflang, opens in a new tab on middle click, and
 * is crawlable. Only the trigger is a button. The head carries the hreflang
 * alternates independently (see SEO.tsx), so the menu may unmount freely.
 *
 * WHY THE FLAGS ARE FILES. The owner asked for flags. Emoji flags are not an
 * option: Windows ships no flag glyphs at all and renders 🇮🇱 as the letters
 * "IL", which is exactly the audience this site is built for. So the artwork
 * ships with the site — see the note above the Flag component.
 *
 * WHY THE NAME STAYS BESIDE THE FLAG. A flag is a country and not a language,
 * and a flag-only control has no accessible name. The name in its own script —
 * עברית, English — is what every serious multilingual site leads with; the
 * flag is the thing the eye finds first. Both, and it reads at a glance and
 * still announces itself properly.
 */

/**
 * The real flags, drawn properly.
 *
 * The first pass drew them by hand in a 20×14 viewBox, and at that size a
 * hand-cut Star of David and a field of dots standing in for fifty stars
 * looked like what they were. These are the actual artwork, 3:2, from the
 * MIT-licensed country-flag-icons set — two files, so the set itself is not a
 * dependency. A national flag carries no copyright of its own.
 *
 * As <img> rather than inline SVG: nothing here needs to be styled from CSS,
 * and this keeps the markup of the menu readable. The hairline ring matters —
 * the Israeli flag is mostly white and would otherwise dissolve into the white
 * panel behind it.
 */
const FLAG_SRC: Record<Language, string> = {
  he: israelFlag,
  en: unitedStatesFlag,
};

const Flag = ({ lang }: { lang: Language }) => (
  <img
    src={FLAG_SRC[lang]}
    alt=""
    aria-hidden="true"
    width={21}
    height={14}
    className="h-[14px] w-[21px] shrink-0 rounded-[2px] object-cover ring-1 ring-foreground/15"
  />
);

const LanguageSwitcher = ({
  className = "",
  /** Light ink, for the charcoal footer. */
  invert = false,
  /** The footer sits at the foot of the page, so its menu opens upward. */
  placement = "bottom",
  /** Shorter, for a row of small print rather than a navigation bar. */
  compact = false,
}: {
  className?: string;
  invert?: boolean;
  placement?: "bottom" | "top";
  compact?: boolean;
}) => {
  const { pathname, search, hash } = useLocation();
  const current = languageFromPath(pathname);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  // Shut on a click anywhere else, and on arriving at another page — a menu
  // left hanging over the new page is how these controls usually break.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className={`relative ${className}`}
      // Tabbing past the last row closes it; without this the panel stays open
      // behind whatever the visitor moved on to.
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={current === "he" ? "שפת האתר: עברית" : "Site language: English"}
        className={`inline-flex items-center gap-2 rounded-full border transition-colors duration-200 ${
          compact ? "h-9 px-3 text-label" : "h-11 px-3.5 text-small"
        } ${
          invert
            ? "border-background/25 text-background/75 hover:border-background/60 hover:text-background"
            : "border-foreground/20 text-foreground/80 hover:border-foreground/45 hover:text-foreground"
        }`}
      >
        <Flag lang={current} />
        <span>{LANGUAGE_LABELS[current]}</span>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.5}
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="menu"
          className={`absolute end-0 z-50 min-w-[190px] overflow-hidden rounded-sm border border-border bg-background py-1 shadow-soft ${
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const chosen = lang === current;
            return (
              <li key={lang} role="none">
                <a
                  role="menuitem"
                  href={localizePath(pathname, lang) + search + hash}
                  hrefLang={lang}
                  lang={lang}
                  dir={lang === "he" ? "rtl" : "ltr"}
                  // The tick is the state; aria-current is the same fact for a
                  // screen reader, which cannot see that the row is tinted.
                  aria-current={chosen ? "true" : undefined}
                  className={`flex items-center gap-3 px-4 py-3 text-small transition-colors duration-200 ${
                    chosen ? "bg-secondary text-foreground" : "text-foreground/85 hover:bg-secondary/60"
                  }`}
                >
                  <Flag lang={lang} />
                  <span className="flex-1 text-start">{LANGUAGE_LABELS[lang]}</span>
                  {chosen && <Check aria-hidden="true" strokeWidth={2} className="h-4 w-4 text-accent" />}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
