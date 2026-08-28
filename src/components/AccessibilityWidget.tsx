import { useEffect, useState } from "react";
import {
  Accessibility,
  X,
  Plus,
  Minus,
  RotateCcw,
  Contrast,
  Link2,
  Underline,
  Type,
} from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "aluma-a11y-settings";

type Settings = {
  fontScale: number; // 1 = 100%
  highContrast: boolean;
  highlightLinks: boolean;
  underlineLinks: boolean;
  readableFont: boolean;
};

const defaultSettings: Settings = {
  fontScale: 1,
  highContrast: false,
  highlightLinks: false,
  underlineLinks: false,
  readableFont: false,
};

const applyToDom = (s: Settings) => {
  const root = document.documentElement;
  root.style.setProperty("--a11y-font-scale", String(s.fontScale));
  root.classList.toggle("a11y-high-contrast", s.highContrast);
  root.classList.toggle("a11y-highlight-links", s.highlightLinks);
  root.classList.toggle("a11y-underline-links", s.underlineLinks);
  root.classList.toggle("a11y-readable-font", s.readableFont);
};

const AccessibilityWidget = () => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = { ...defaultSettings, ...JSON.parse(raw) } as Settings;
        setSettings(parsed);
        applyToDom(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-a11y-panel", handler);
    return () => window.removeEventListener("open-a11y-panel", handler);
  }, []);

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    applyToDom(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const reset = () => {
    setSettings(defaultSettings);
    applyToDom(defaultSettings);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const Toggle = ({
    label,
    active,
    onClick,
    icon: Icon,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
    icon: typeof Contrast;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-sm border transition-smooth text-start ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-foreground border-border hover:border-primary/50"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <Icon className="w-4 h-4 shrink-0" />
    </button>
  );

  return (
    <>
      {/* end-6 = left under RTL, the opposite corner from the WhatsApp FAB
          (start-6). z-40 keeps both FABs under the cookie banner (z-50). */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="פתיחת תפריט נגישות"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-5 start-5 z-40 flex w-12 h-12 rounded-full bg-foreground/85 text-background items-center justify-center shadow-soft backdrop-blur-sm transition-opacity duration-200 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Accessibility className="w-7 h-7" />
      </button>

      {/* justify-end so the panel opens on the same side as the button that
          opened it — `justify-start` resolved to the right in RTL while the
          trigger sits on the left. */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="תפריט נגישות"
        >
          <button
            type="button"
            aria-label="סגירת תפריט נגישות"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div className="relative bg-background w-full md:w-[360px] md:m-6 md:rounded-sm shadow-luxury max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-primary text-primary-foreground">
              <div className="flex items-center gap-2">
                <Accessibility className="w-5 h-5" />
                <h2 className="font-display text-lg">תפריט נגישות</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="סגירה"
                className="w-9 h-9 rounded-sm flex items-center justify-center hover:bg-primary-foreground/10 transition-smooth"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Font size */}
              <div>
                <div className="text-xs tracking-wider uppercase text-muted-foreground mb-2">
                  גודל טקסט
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="הקטנת טקסט"
                    onClick={() =>
                      update({ fontScale: Math.max(0.85, settings.fontScale - 0.1) })
                    }
                    className="w-11 h-11 rounded-sm border border-border bg-card hover:border-primary/50 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center font-display text-lg text-primary">
                    {Math.round(settings.fontScale * 100)}%
                  </div>
                  <button
                    type="button"
                    aria-label="הגדלת טקסט"
                    onClick={() =>
                      update({ fontScale: Math.min(1.5, settings.fontScale + 0.1) })
                    }
                    className="w-11 h-11 rounded-sm border border-border bg-card hover:border-primary/50 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                <Toggle
                  label="ניגודיות גבוהה"
                  active={settings.highContrast}
                  onClick={() => update({ highContrast: !settings.highContrast })}
                  icon={Contrast}
                />
                <Toggle
                  label="הדגשת קישורים"
                  active={settings.highlightLinks}
                  onClick={() => update({ highlightLinks: !settings.highlightLinks })}
                  icon={Link2}
                />
                <Toggle
                  label="קו תחתון בקישורים"
                  active={settings.underlineLinks}
                  onClick={() => update({ underlineLinks: !settings.underlineLinks })}
                  icon={Underline}
                />
                <Toggle
                  label="גופן קריא יותר"
                  active={settings.readableFont}
                  onClick={() => update({ readableFont: !settings.readableFont })}
                  icon={Type}
                />
              </div>

              <button
                type="button"
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-sm border border-border bg-card hover:bg-secondary text-sm font-medium text-foreground transition-smooth"
              >
                <RotateCcw className="w-4 h-4" />
                איפוס הגדרות
              </button>

              <div className="pt-4 border-t border-border text-center">
                <Link
                  to="/accessibility"
                  onClick={() => setOpen(false)}
                  className="text-sm text-primary hover:text-accent transition-smooth"
                >
                  קריאת הצהרת הנגישות המלאה
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityWidget;
