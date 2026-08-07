import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";

const STORAGE_KEY = "aluma-cta-dismissed";

const StickyCTA = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { pathname } = useLocation();

  const hidden = pathname === "/faq";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      setDismissed(true);
      return;
    }
    const onScroll = () => setVisible(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  if (hidden || dismissed) return null;

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-30 hidden md:block transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
      role="region"
      aria-label="הצעה ליצירת קשר"
    >
      <div className="container-luxury pb-4 md:pb-6 px-24 md:px-24">
        <div className="relative overflow-hidden rounded-sm border border-border shadow-luxury px-3 md:px-4 py-2 md:py-3 flex items-center justify-between gap-2 md:gap-6 bg-background/95 backdrop-blur-md max-w-md md:max-w-none mx-auto">
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="סגירה"
              className="relative z-10 w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-sm flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition-smooth"
            >
              <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>

            <div className="relative z-10 flex-1 text-right min-w-0 text-foreground">
              <div className="font-display text-sm md:text-lg leading-tight truncate">
                רוצים הצעת מחיר בהתאמה אישית?
              </div>
              <div className="hidden md:block text-xs opacity-70 mt-0.5">
                נחזור אליכם בהקדם עם הצעת מחיר אישית מותאמת עבורכם
              </div>
            </div>

            <Link
              to="/faq#contact"
              className="relative z-10 shrink-0 inline-flex items-center gap-1.5 md:gap-2 bg-accent/90 hover:bg-accent text-accent-foreground px-3 md:px-6 py-1.5 md:py-2.5 rounded-sm text-xs md:text-base font-medium tracking-wide transition-smooth shadow-soft backdrop-blur-sm"
            >
              השאירו פרטים
              <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Link>
          </div>
      </div>
    </div>
  );
};

export default StickyCTA;
