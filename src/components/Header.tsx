import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import alumaLogo from "@/assets/aluma-logo.png";
import { useCollections } from "@/hooks/useCollectionsData";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { SITE } from "@/config/site";

// Desktop nav link: a barely-rounded light-grey pill that fades in on hover, with
// the label sitting in soft charcoal and deepening as it fills.
const navItem =
  "inline-flex items-center rounded-[10px] px-2.5 xl:px-3.5 py-2 text-sm xl:text-[15px] 2xl:text-base font-medium tracking-wide transition-colors duration-300";
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
  const [expanded, setExpanded] = useState<string | null>(null);
  // Desktop dropdowns: `hovered` opens on pointer-over; `pinned` is a click-locked
  // menu that stays open after the pointer leaves (until re-click / outside / Esc).
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const { collections } = useCollections();

  // No "all collections" entry — the קולקציות button itself goes to the
  // unfiltered page, and filtering happens there in the sidebar.
  const collectionsSub = useMemo(
    () =>
      collections.map((c) => ({
        label: c.name_he,
        to: localized(`/collections#${c.slug}`),
      })),
    [collections, localized]
  );

  const navLinks = useMemo(
    () => [
      { label: t("nav.home"), to: localized("/") },
      { label: t("nav.story"), to: localized("/story") },
      { label: t("nav.collections"), to: localized("/collections"), submenu: collectionsSub },
      {
        label: t("nav.materials"),
        to: localized("/materials"),
        submenu: [
          { label: t("materialsSub.sunbrella"), to: localized("/materials/sunbrella") },
          { label: t("materialsSub.aluminum"), to: localized("/materials/aluminum") },
          { label: t("materialsSub.granitePorcelain"), to: localized("/materials/granite-porcelain") },
          { label: t("materialsSub.polystone"), to: localized("/materials/polystone") },
        ],
      },
      { label: t("nav.projects"), to: localized("/projects") },
      {
        label: t("nav.diy"),
        to: localized("/diy"),
        submenu: [
          { label: t("diySub.designer"), to: localized("/designer") },
          { label: t("diySub.fabric"), to: localized("/fabric") },
          { label: t("diySub.ar"), to: localized("/ar") },
          { label: t("diySub.questionnaire"), to: localized("/questionnaire") },
        ],
      },
      { label: t("nav.blog"), to: localized("/blog") },
      { label: t("nav.faq"), to: localized("/faq") },
      { label: t("nav.club"), to: localized("/club") },
      { label: t("nav.contact"), to: localized("/contact") },
    ],
    [collectionsSub, t, localized]
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

  // A click-pinned desktop dropdown closes on outside click or Escape.
  useEffect(() => {
    if (!pinned) return;
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setPinned(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPinned(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [pinned]);

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
          ref={navRef}
          className="hidden lg:flex flex-1 items-center justify-center gap-0.5 xl:gap-1 2xl:gap-1.5 whitespace-nowrap"
        >
          {navLinks.map((link) => {
            // While a menu is pinned open, only that one shows; otherwise hover rules.
            const isOpen = pinned ? pinned === link.to : hovered === link.to;
            const chevron = link.submenu ? (
              <ChevronDown
                className={`ms-1 h-3.5 w-3.5 opacity-70 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            ) : null;
            return (
              <div
                key={link.to}
                className="relative"
                onMouseEnter={() => setHovered(link.to)}
                onMouseLeave={() => setHovered((h) => (h === link.to ? null : h))}
              >
                {/* Every top-level item navigates. Submenus open on hover (and
                    stay pinned on click of the chevron area) but never swallow
                    the click — קולקציות goes to the unfiltered page. */}
                <NavLink
                  to={link.to}
                  // Both language roots are "home"; without /en here the home
                  // item would read as active on every English page.
                  end={link.to === "/" || link.to === "/en"}
                  className={({ isActive }) =>
                    `${navItem} ${isActive || isOpen ? navActive : navRest}`
                  }
                >
                  {link.label}
                  {chevron}
                </NavLink>

                {link.submenu && (
                  <div
                    className={`absolute top-full right-1/2 translate-x-1/2 pt-3 z-50 transition-all duration-200 ease-out ${
                      isOpen
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-1 pointer-events-none"
                    }`}
                  >
                    <div
                      role="menu"
                      className="min-w-[240px] rounded-xl border border-border bg-popover p-1.5 shadow-luxury"
                    >
                      {link.submenu.map((sub) => (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          role="menuitem"
                          onClick={() => {
                            setPinned(null);
                            setHovered(null);
                          }}
                          className="block rounded-lg px-4 py-2.5 text-sm text-right text-foreground transition-colors duration-200 hover:bg-secondary/70 hover:text-accent"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
            {navLinks.map((link, i) => {
              const isOpen = expanded === link.to;
              const hasSub = !!link.submenu;
              return (
                <div
                  key={link.to}
                  style={{ transitionDelay: open ? `${100 + i * 50}ms` : "0ms" }}
                  className={`transition-all duration-500 ${
                    open ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border/40">
                    <NavLink
                      to={link.to}
                      end={link.to === "/"}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex-1 font-display text-xl text-right py-3 ${
                          isActive ? "text-accent" : "text-foreground hover:text-accent"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                    {hasSub && (
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : link.to)}
                        aria-label={isOpen ? "סגור תת תפריט" : "פתח תת תפריט"}
                        aria-expanded={isOpen}
                        className="w-10 h-10 shrink-0 rounded-sm flex items-center justify-center text-primary/70 hover:text-accent hover:bg-secondary/40 transition-smooth"
                      >
                        <ChevronDown
                          className={`h-5 w-5 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {hasSub && isOpen && (
                    <div className="flex flex-col py-2 pr-4 gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      {link.submenu!.map((sub) => (
                        <NavLink
                          key={`${link.to}-${sub.to}`}
                          to={sub.to}
                          onClick={() => setOpen(false)}
                          className={({ isActive }) =>
                            `text-sm tracking-wide text-right py-1.5 ${
                              isActive ? "text-accent" : "text-foreground hover:text-accent"
                            }`
                          }
                        >
                          ← {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div
              className="mt-8 flex items-center gap-2"
              style={{
                transition: "all 0.5s",
                transitionDelay: open ? `${100 + navLinks.length * 50}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(16px)",
              }}
            >
              <span className="h-px flex-1 bg-primary/30" />
              <span
                className="text-[9px] tracking-[0.2em] uppercase text-foreground whitespace-nowrap"
                dir="ltr"
              >
                Where outdoor becomes lifestyle
              </span>
              <span className="h-px flex-1 bg-primary/30" />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
