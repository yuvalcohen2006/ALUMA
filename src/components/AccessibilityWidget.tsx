import { useEffect, useState } from "react";
import {
  Accessibility,
  Plus,
  Minus,
  RotateCcw,
  Contrast,
  Link2,
  Underline,
  Type,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const STORAGE_KEY = "aluma-a11y-settings";

const MIN_FONT_SCALE = 0.85;
const MAX_FONT_SCALE = 1.3;

const clampScale = (n: number) =>
  Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, n));

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
        parsed.fontScale = clampScale(parsed.fontScale);
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
      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-[10px] border transition-smooth text-right ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-foreground border-border hover:border-primary/50"
      }`}
    >
      <span className="text-meta font-medium">{label}</span>
      <Icon className="w-4 h-4 shrink-0" />
    </button>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="פתיחת תפריט נגישות"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="hidden md:flex fixed bottom-24 md:bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-primary text-background items-center justify-center shadow-luxury hover:bg-accent transition-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Accessibility className="w-7 h-7" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" aria-describedby={undefined}>
          <div className="flex items-center gap-2 ps-14 pe-5 pt-6 pb-4 border-b border-border">
            <Accessibility className="w-6 h-6 text-primary shrink-0" />
            <SheetTitle>תפריט נגישות</SheetTitle>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Font size */}
            <div>
              <div className="text-meta tracking-wider text-muted-foreground mb-2">
                גודל טקסט
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="הקטנת טקסט"
                  onClick={() =>
                    update({ fontScale: clampScale(settings.fontScale - 0.1) })
                  }
                  className="w-11 h-11 rounded-[10px] border border-border bg-card hover:border-primary/50 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center font-display text-card-title text-foreground">
                  {Math.round(settings.fontScale * 100)}%
                </div>
                <button
                  type="button"
                  aria-label="הגדלת טקסט"
                  onClick={() =>
                    update({ fontScale: clampScale(settings.fontScale + 0.1) })
                  }
                  className="w-11 h-11 rounded-[10px] border border-border bg-card hover:border-primary/50 flex items-center justify-center"
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[10px] border border-border bg-card hover:bg-secondary text-meta font-medium text-foreground transition-smooth"
            >
              <RotateCcw className="w-4 h-4" />
              איפוס הגדרות
            </button>

            <div className="pt-4 border-t border-border text-center">
              <Link
                to="/accessibility"
                onClick={() => setOpen(false)}
                className="text-meta text-accent hover:text-primary transition-smooth"
              >
                קריאת הצהרת הנגישות המלאה
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AccessibilityWidget;
