import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";

const STORAGE_KEY = "aluma-cta-dismissed";

const StickyCTA = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { pathname } = useLocation();

  const hidden = pathname === "/contact";

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
      <div className="container-luxury pb-4 md:pb-6 px-24">
        <div className="relative overflow-hidden rounded-[14px] border border-border shadow-luxury px-4 py-3 flex items-center justify-between gap-6 bg-background/95 backdrop-blur-md">
          <div className="relative z-10 flex-1 text-right min-w-0 text-foreground">
            <div className="font-display text-card-title truncate">
              רוצים הצעת מחיר בהתאמה אישית?
            </div>
            <div className="text-meta opacity-70 mt-0.5">
              נחזור אליכם בהקדם עם הצעת מחיר אישית מותאמת עבורכם
            </div>
          </div>

          <Link
            to="/contact"
            className="relative z-10 shrink-0 inline-flex items-center gap-2 bg-accent/90 hover:bg-accent text-accent-foreground px-6 py-2.5 rounded-[10px] text-meta font-medium tracking-wide transition-smooth shadow-soft backdrop-blur-sm"
          >
            השאירו פרטים
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="סגירה"
            className="relative z-10 w-8 h-8 shrink-0 rounded-[10px] flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition-smooth"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyCTA;
