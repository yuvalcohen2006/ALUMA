import { useEffect, useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import alumaLogo from "@/assets/aluma-logo.png";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { SITE } from "@/config/site";

// Desktop nav link: a barely-rounded light-grey pill that fades in on hover, with
// the label sitting in soft charcoal and deepening as it fills.
const navItem =
"inline-flex items-center rounded-sm px-2.5 xl:px-3.5 py-2 text-sm 2xl:text-base font-medium tracking-wide transition-colors duration-300";
const navRest = "text-foreground-soft hover:bg-foreground/[0.07] hover:text-foreground";
const navActive = "bg-foreground/[0.09] text-foreground";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { to: localized } = useLocalizedPath();
  // Interior pages open straight onto the background with no sand band, so the
  // header needs its border immediately. Only the home page, whose hero image
  // separates it on its own, waits for scroll. Both language roots count as
  // home.
  const forceBorder = pathname !== "/" && pathname !== "/en";
  const [open, setOpen] = useState(false);
  // Six flat links, no dropdowns. Skargaarden runs five; the one reference
  // site that uses a mega-menu (Audo) is also the loudest of the set. The
  // collections dropdown in particular was the client's complaint #3 — he
  // wanted the page, not a list unfolding beneath the cursor.
  //
  // Order is his, given left-to-right; in RTL the first item renders rightmost,
  // so this array is that list reversed. שווה לדעת is not here: he called it
  // "really a side-thing", so it lives in the footer.
  const navLinks = useMemo(
    () => [
      { label: t("nav.collections"), to: localized("/collections") },
      { label: t("nav.projects"), to: localized("/projects") },
      { label: t("nav.diy"), to: localized("/diy") },
      { label: t("nav.faq"), to: localized("/faq") },
      { label: t("nav.club"), to: localized("/club") },
      { label: t("nav.story"), to: localized("/story") },
    ],
    [t, localized]
  );




  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      dir="rtl"
      className={`fixed top-0 inset-x-0 z-40 transition-smooth ${
        scrolled
          ? "bg-background/90 backdrop-blur-md shadow-soft border-b border-border"
          : forceBorder
          ? "bg-background/60 backdrop-blur-sm border-b border-border"
          : "bg-background/60 backdrop-blur-sm"
      }`}
    >
      <div dir="rtl" className="w-full px-4 lg:px-6 flex items-center h-24 gap-4">

        {/* Logo (right side in RTL) */}
        <div className="hidden lg:flex items-center shrink-0">
          <Link to={localized("/")} aria-label="Aluma">
            <img src={alumaLogo} alt="Aluma" className="h-7 xl:h-8 w-auto" />
          </Link>
        </div>

        {/* Mobile logo. Sits on the right like the desktop one — it used to
            carry `order-last`, which flipped the brand mark to the left below
            the lg breakpoint. `me-auto` pushes the hamburger to the far edge. */}
        <Link to={localized("/")} className="lg:hidden shrink-0 me-auto" aria-label="Aluma">
          <img src={alumaLogo} alt="Aluma" className="h-7 md:h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden lg:flex flex-1 items-center justify-center gap-0.5 xl:gap-1 2xl:gap-1.5 whitespace-nowrap"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              // Both language roots are "home"; without /en here the home item
              // would read as active on every English page.
              end={link.to === "/" || link.to === "/en"}
              className={({ isActive }) =>
                `relative ${navItem} ${isActive ? navActive : navRest}`
              }
            >
              {link.label}
              {/* Absolutely positioned: an inline badge widened the pill and
                  pushed every neighbouring item along. This one floats over the
                  corner and costs the button no width. */}
              {link.badge && (
                <span className="pointer-events-none absolute -top-0.5 end-0 rounded-full bg-primary px-1.5 py-px text-label font-medium text-primary-foreground">
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {SITE.enableEnglish && (
          <div className="hidden lg:flex shrink-0">
            <LanguageSwitcher />
          </div>
        )}

        {/* WhatsApp — last child, so RTL places it at the far left of the bar */}
        <a
          href="https://wa.me/972504519062"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="צרו קשר בוואטסאפ"
          className="hidden lg:flex shrink-0 w-11 h-11 rounded-full bg-[#25D366] text-white items-center justify-center shadow-soft hover:scale-110 transition-smooth"
        >
          <WhatsAppIcon className="w-6 h-6" />
        </a>

        {/* Mobile menu button */}
        <div className="lg:hidden relative z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            aria-label={open ? "סגור תפריט" : "פתח תפריט"}
            aria-expanded={open}
          >
            {open ? <X className="h-10 w-10" /> : <Menu className="h-10 w-10" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu, slide-in from right */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="סגירת תפריט"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <nav
          className={`absolute top-0 right-0 bottom-0 h-dvh w-full sm:w-[90%] sm:max-w-md bg-background shadow-luxury border-l border-border flex flex-col transition-transform duration-500 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Sticky top bar with close button */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 h-24 bg-background border-b border-border/60">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="סגירת תפריט"
              className="w-10 h-10 rounded-sm flex items-center justify-center text-primary hover:bg-secondary/50 transition-smooth"
            >
              <X className="h-6 w-6" />
            </button>
            <Link to={localized("/")} onClick={() => setOpen(false)} aria-label="Aluma">
              <img src={alumaLogo} alt="Aluma" className="h-7 w-auto" />
            </Link>
          </div>

          {/* Scrollable links area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-1">
            {navLinks.map((link, i) => (
              <div
                key={link.to}
                style={{ transitionDelay: open ? `${100 + i * 50}ms` : "0ms" }}
                className={`transition-all duration-500 ${
                  open ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                }`}
              >
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block border-b border-border/40 font-display text-xl text-start py-3 ${
                      isActive ? "text-accent" : "text-foreground hover:text-accent"
                    }`
                  }
                >
                  {link.label}
                  {link.badge && (
                    <span className="ms-2 rounded-full bg-foreground/15 px-2 py-0.5 text-label font-medium text-primary align-middle">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              </div>
            ))}

            <div
              className="mt-8 flex items-center gap-2"
              style={{
                transition: "all 0.5s",
                transitionDelay: open ? `${100 + navLinks.length * 50}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(16px)",
              }}
            >
              <span className="h-px flex-1 bg-foreground/15" />
              <span
                className="text-label tracking-[0.2em] uppercase text-foreground whitespace-nowrap"
                dir="ltr"
              >
                Where outdoor becomes lifestyle
              </span>
              <span className="h-px flex-1 bg-foreground/15" />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
