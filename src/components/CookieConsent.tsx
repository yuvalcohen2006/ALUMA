import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { getConsent, setConsent, type ConsentValue } from "@/lib/consent";
import { loadPixel } from "@/lib/pixel";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!getConsent()) setVisible(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  const decide = (value: ConsentValue) => {
    setConsent(value);
    // Accepting activates the pixel immediately; useSiteTracking picks up the
    // consent change and begins first-party analytics + fires PageView.
    if (value === "accepted") loadPixel();
    setVisible(false);
  };

  if (!visible) return null;

  // bottom-24 from md up clears the WhatsApp FAB, which shares this corner
  // (start-6) between md and lg. z-50 sits above both FABs (z-40).
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="הסכמה לעוגיות"
      className="fixed inset-x-3 bottom-3 z-50 md:inset-x-auto md:start-4 md:bottom-24 md:max-w-md"
    >
      <div className="relative bg-background border border-foreground/15 shadow-soft rounded-sm p-4 md:p-5 text-start">
        <button
          aria-label="סגירה"
          onClick={() => decide("declined")}
          className="absolute top-2 end-2 text-muted-foreground hover:text-primary transition-smooth"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="font-display text-base md:text-lg text-foreground mb-1">
          העדפות פרטיות
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-3">
          האתר משתמש בעוגיות לשיפור החוויה ולניתוח תעבורה.
          לפרטים נוספים ראו{" "}
          <Link to="/privacy" className="text-foreground underline underline-offset-2">
            מדיניות הפרטיות
          </Link>
          .
        </p>
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => decide("declined")}
            className="text-xs h-9"
          >
            רק חיוניות
          </Button>
          <Button
            size="sm"
            onClick={() => decide("accepted")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-9 px-5 rounded-sm"
          >
            אישור
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
