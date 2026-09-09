import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import CookieConsent from "@/components/CookieConsent";
import { ReactNode } from "react";
import { LANGUAGE_DIR } from "@/i18n";
import { useLocalizedPath } from "@/lib/useLocalizedPath";

const Layout = ({
  children,
  hebrewOnly = false,
}: {
  children: ReactNode;
  /**
   * For a page whose copy has not been translated yet.
   *
   * <main> normally takes the language's direction, which is right for a page
   * whose words follow. On a page that is still entirely Hebrew literals, /en
   * gave it dir="ltr" — so Hebrew sentences were laid out left-to-right and
   * every sentence-final full stop jumped to the front of the line, on top of
   * every logical property pointing the wrong way. The Header and Footer
   * already pin themselves to rtl for exactly this reason.
   */
  hebrewOnly?: boolean;
}) => {
  const { lang } = useLocalizedPath();
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Skip to main content, keyboard a11y */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:end-3 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-sm focus:shadow-luxury"
      >
        דלגו לתוכן הראשי
      </a>
      <Header />
      {/*
        The direction of the CONTENT, not a constant. This was hardcoded rtl,
        and the nearest dir attribute is what every logical property inside
        resolves against — so the entire English site laid out right-to-left:
        text-start right-aligned every English heading and paragraph, and every
        ms-/me-/start-/end- on every page pointed the wrong way.

        Only <main> changes. Header and Footer keep their explicit dir="rtl"
        because their contents are still untranslated Hebrew literals, and that
        attribute is what keeps them reading correctly on /en.
      */}
      <main
        id="main-content"
        dir={hebrewOnly ? "rtl" : LANGUAGE_DIR[lang]}
        tabIndex={-1}
        className="flex-1 focus:outline-none"
      >
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      
      <AccessibilityWidget />
      <CookieConsent />
    </div>
  );
};

export default Layout;
