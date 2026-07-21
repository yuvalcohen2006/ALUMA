import { useLocation } from "react-router-dom";
import { Phone, Accessibility } from "lucide-react";

const WhatsAppIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

/**
 * Mobile-only sticky action bar.
 * Three high-conversion CTAs: WhatsApp, Phone call, and a quote request.
 * Hidden on the contact page (already on the form) and on /admin.
 */
const MobileActionBar = () => {
  const { pathname } = useLocation();
  if (pathname === "/contact" || pathname.startsWith("/admin") || pathname === "/auth") return null;

  return (
    <>
      {/* Safe-area spacer so page content isn't hidden behind the bar */}
      <div aria-hidden="true" className="md:hidden h-16" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
      <nav
        dir="rtl"
        aria-label="פעולות מהירות"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-footer/95 backdrop-blur-md border-t border-background/15 shadow-luxury"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-3 items-stretch h-16">
          <a
            href="https://wa.me/972504519062"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="שליחת הודעה בוואטסאפ"
            className="flex flex-col items-center justify-center gap-1 text-background active:bg-background/10 transition-smooth"
          >
            <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
            <span className="text-[11px] font-medium">WhatsApp</span>
          </a>
          <a
            href="tel:+972504519062"
            aria-label="חיוג טלפוני"
            className="flex flex-col items-center justify-center gap-1 text-background border-x border-background/15 active:bg-background/10 transition-smooth"
          >
            <Phone className="w-5 h-5 text-accent" />
            <span className="text-[11px] font-medium">חיוג</span>
          </a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-a11y-panel"))}
            aria-label="פתיחת תפריט נגישות"
            className="flex flex-col items-center justify-center gap-1 text-background active:bg-background/10 transition-smooth"
          >
            <Accessibility className="w-5 h-5" />
            <span className="text-[11px] font-medium">נגישות</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileActionBar;
