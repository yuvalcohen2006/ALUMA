import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, languageFromPath, type Language } from "@/i18n";
import { localizePath } from "@/lib/useLocalizedPath";

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
 * WHY THE FLAGS ARE DRAWN. The owner asked for flags. Emoji flags are not an
 * option: Windows ships no flag glyphs at all and renders 🇮🇱 as the letters
 * "IL", which is exactly the audience this site is built for. These are two
 * 20×14 SVGs instead.
 *
 * WHY THE NAME STAYS BESIDE THE FLAG. A flag is a country and not a language,
 * and a flag-only control has no accessible name. The name in its own script —
 * עברית, English — is what every serious multilingual site leads with; the
 * flag is the thing the eye finds first. Both, and it reads at a glance and
 * still announces itself properly.
 */

const IsraelFlag = () => (
  <svg viewBox="0 0 20 14" width="20" height="14" aria-hidden="true" focusable="false" className="shrink-0 rounded-[2px]">
    <rect width="20" height="14" fill="#fff" />
    <rect y="2" width="20" height="1.7" fill="#0038B8" />
    <rect y="10.3" width="20" height="1.7" fill="#0038B8" />
    {/* A filled hexagram, not two stroked triangles: at 20px a 0.75 stroke
        turns the star into a smudge. */}
    <path
      fill="#0038B8"
      fillRule="evenodd"
      d="M10 3.6 11.27 5.8h2.54l-1.27 2.2 1.27 2.2h-2.54L10 12.4 8.73 10.2H6.19l1.27-2.2-1.27-2.2h2.54zm0 1.9L9.28 6.75h1.44zm-2.17 1.3 .72 1.25-.72 1.25h-1.4l.72-1.25-.72-1.25zm4.34 0h-1.4l.72 1.25-.72 1.25h1.4l-.72-1.25zM9.28 9.25 10 10.5l.72-1.25z"
    />
    <rect width="20" height="14" fill="none" stroke="#0000001a" strokeWidth="1" />
  </svg>
);

const UnitedStatesFlag = () => (
  <svg viewBox="0 0 20 14" width="20" height="14" aria-hidden="true" focusable="false" className="shrink-0 rounded-[2px]">
    <rect width="20" height="14" fill="#fff" />
    {[0, 2, 4, 6, 8, 10, 12].map((i) => (
      <rect key={i} y={(i * 14) / 13} width="20" height={14 / 13} fill="#B22234" />
    ))}
    <rect width="8.6" height={(7 * 14) / 13} fill="#3C3B6E" />
    <g fill="#fff">
      {[1.1, 2.9, 4.7, 6.5].map((x) =>
        [1.1, 2.9, 4.7, 6.4].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.42" />),
      )}
    </g>
    <rect width="20" height="14" fill="none" stroke="#0000001a" strokeWidth="1" />
  </svg>
);

const FLAGS: Record<Language, () => JSX.Element> = {
  he: IsraelFlag,
  en: UnitedStatesFlag,
};

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

  const CurrentFlag = FLAGS[current];

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
        <CurrentFlag />
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
            const Flag = FLAGS[lang];
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
                  <Flag />
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
