import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, Menu, X } from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { Button } from "@/components/ui/button";
import alumaLogo from "@/assets/aluma-logo.png";
import { useCollections } from "@/hooks/useCollectionsData";
import { WhatsAppIcon } from "@/components/WhatsAppButton";

type SubLink = { label: string; to: string };
type NavEntry = { label: string; to?: string; submenu?: SubLink[] };

const materialsSub: SubLink[] = [
  { label: "בד Sunbrella", to: "/materials/sunbrella" },
  { label: "אלומיניום", to: "/materials/aluminum" },
  { label: "שיש גרניט פורצלן", to: "/materials/granite-porcelain" },
  { label: "PolyStone", to: "/materials/polystone" },
];

const studioSub: SubLink[] = [
  { label: "עצבו סלון", to: "/designer" },
  { label: "בחרו את הבד", to: "/fabric" },
  { label: "תצוגה במרחב (AR)", to: "/ar" },
  { label: "שאלון חכם", to: "/questionnaire" },
];

const aboutSub: SubLink[] = [
  { label: "הסיפור שלנו", to: "/story" },
  { label: "שאלות ותשובות", to: "/faq" },
  { label: "הצהרת נגישות", to: "/accessibility" },
];

// Desktop nav link: a barely-rounded light-grey pill that fades in on hover, with
// the label sitting in soft charcoal and deepening as it fills.
const navItem =
  "group inline-flex items-center rounded-[10px] px-3.5 py-2 text-meta font-medium tracking-wide transition-colors duration-300";
const navRest = "text-foreground-soft hover:bg-foreground/[0.07] hover:text-foreground";
const navActive = "bg-foreground/[0.09] text-foreground";
// A trigger whose submenu is open reads as active regardless of route.
const navOpen =
  "data-[state=open]:bg-foreground/[0.09] data-[state=open]:text-foreground";

const panelClass =
  "min-w-[240px] rounded-[10px] border border-border bg-popover p-1.5 shadow-luxury animate-in fade-in slide-in-from-top-1 duration-200";
const panelItemClass =
  "block rounded-[10px] px-4 py-2.5 text-meta text-right text-foreground transition-colors duration-200 hover:bg-secondary/70 hover:text-accent focus-visible:bg-secondary/70 focus-visible:text-accent outline-none";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  // Interior pages open straight onto the background with no sand band, so the
  // header needs its border immediately. Only the home page, whose hero image
  // separates it on its own, waits for scroll.
  const forceBorder = pathname !== "/";
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  // Radix NavigationMenu is controlled so a Space keypress on a link-trigger can
  // open the submenu without navigating (Enter still follows the hub link).
  const [menuValue, setMenuValue] = useState("");
  const { collections } = useCollections();

  // No "all collections" entry — the קולקציות trigger itself goes to the
  // unfiltered page, and filtering happens there in the sidebar.
  const collectionsSub = useMemo<SubLink[]>(
    () => collections.map((c) => ({ label: c.name_he, to: `/collections#${c.slug}` })),
    [collections]
  );

  // אודות has no hub route, so it is the one trigger that only opens a menu.
  const mainNav = useMemo<NavEntry[]>(
    () => [
      { label: "קולקציות", to: "/collections", submenu: collectionsSub },
      { label: "פרויקטים", to: "/projects" },
      { label: "חומרים", to: "/materials", submenu: materialsSub },
      { label: "הסטודיו", to: "/diy", submenu: studioSub },
      { label: "מגזין", to: "/blog" },
      { label: "אודות", submenu: aboutSub },
      { label: "מועדון", to: "/club" },
    ],
    [collectionsSub]
  );

  // The drawer carries the same IA; צרו קשר lives here as a plain row because
  // the desktop bar renders it as a separate CTA outside the menu.
  const mobileNav = useMemo<NavEntry[]>(
    () => [...mainNav, { label: "צרו קשר", to: "/contact" }],
    [mainNav]
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

  // Clicking a hub trigger navigates without Radix noticing — close on route change.
  useEffect(() => {
    setMenuValue("");
  }, [pathname]);

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
        <div className="hidden xl:flex items-center shrink-0">
          <Link to="/" aria-label="Aluma">
            <img src={alumaLogo} alt="Aluma" className="h-8 w-auto" />
          </Link>
        </div>

        {/* Mobile logo */}
        <Link to="/" className="xl:hidden shrink-0 order-last" aria-label="Aluma">
          <img src={alumaLogo} alt="Aluma" className="h-7 md:h-8 w-auto" />
        </Link>

        {/* Desktop nav — Radix NavigationMenu: hover opens with delay, click on a
            hub trigger navigates, Space/ArrowDown opens for keyboard users,
            arrows walk items, Esc closes and restores focus. */}
        <NavigationMenu.Root
          dir="rtl"
          value={menuValue}
          onValueChange={setMenuValue}
          aria-label="ניווט ראשי"
          className="hidden xl:flex flex-1 justify-center"
        >
          <NavigationMenu.List className="flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap">
            {mainNav.map((link) => {
              if (!link.submenu) {
                return (
                  <NavigationMenu.Item key={link.label}>
                    <NavigationMenu.Link asChild>
                      <NavLink
                        to={link.to!}
                        className={({ isActive }) =>
                          `${navItem} ${isActive ? navActive : navRest}`
                        }
                      >
                        {link.label}
                      </NavLink>
                    </NavigationMenu.Link>
                  </NavigationMenu.Item>
                );
              }

              const chevron = (
                <ChevronDown
                  className="ms-1 h-3.5 w-3.5 opacity-70 transition-transform duration-300 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              );

              return (
                <NavigationMenu.Item key={link.label} value={link.label} className="relative">
                  {link.to ? (
                    <NavigationMenu.Trigger asChild>
                      <NavLink
                        to={link.to}
                        onKeyDown={(e) => {
                          if (e.key === " ") {
                            e.preventDefault();
                            setMenuValue((v) => (v === link.label ? "" : link.label));
                          }
                        }}
                        className={({ isActive }) =>
                          `${navItem} ${navOpen} ${isActive ? navActive : navRest}`
                        }
                      >
                        {link.label}
                        {chevron}
                      </NavLink>
                    </NavigationMenu.Trigger>
                  ) : (
                    <NavigationMenu.Trigger className={`${navItem} ${navOpen} ${navRest}`}>
                      {link.label}
                      {chevron}
                    </NavigationMenu.Trigger>
                  )}

                  <NavigationMenu.Content className="absolute top-full right-1/2 translate-x-1/2 pt-3 z-50">
                    <div className={panelClass}>
                      {link.submenu.map((sub) => (
                        <NavigationMenu.Link asChild key={sub.to}>
                          <Link to={sub.to} className={panelItemClass}>
                            {sub.label}
                          </Link>
                        </NavigationMenu.Link>
                      ))}
                    </div>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              );
            })}
          </NavigationMenu.List>
        </NavigationMenu.Root>

        {/* Contact CTA + WhatsApp — last children, so RTL places them at the far
            left of the bar, separated from the menu by the centered nav. */}
        <div className="hidden xl:flex items-center gap-3 shrink-0">
          <Link
            to="/contact"
            className="inline-flex items-center rounded-[10px] border border-primary/40 px-4 py-2 text-meta font-medium tracking-wide text-primary transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
          >
            צרו קשר
          </Link>
          <a
            href="https://wa.me/972504519062"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="צרו קשר בוואטסאפ"
            className="flex shrink-0 w-11 h-11 rounded-full bg-[#25D366] text-white items-center justify-center shadow-soft hover:scale-110 transition-smooth"
          >
            <WhatsAppIcon className="w-6 h-6" />
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="xl:hidden relative z-50 order-first me-auto">
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
        className={`xl:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
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
            <Link to="/" onClick={() => setOpen(false)} aria-label="Aluma">
              <img src={alumaLogo} alt="Aluma" className="h-7 w-auto" />
            </Link>
          </div>

          {/* Scrollable links area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-1">
            {mobileNav.map((link, i) => {
              const isOpen = expanded === link.label;
              const hasSub = !!link.submenu;
              return (
                <div
                  key={link.label}
                  style={{ transitionDelay: open ? `${100 + i * 50}ms` : "0ms" }}
                  className={`transition-all duration-500 ${
                    open ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border/40">
                    {link.to ? (
                      <NavLink
                        to={link.to}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `flex-1 font-display text-xl text-right py-3 ${
                            isActive ? "text-accent" : "text-foreground hover:text-accent"
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    ) : (
                      /* אודות has no hub page — the label itself toggles the submenu */
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : link.label)}
                        aria-expanded={isOpen}
                        className="flex-1 font-display text-xl text-right py-3 text-foreground hover:text-accent"
                      >
                        {link.label}
                      </button>
                    )}
                    {hasSub && (
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : link.label)}
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
                    <div className="flex flex-col py-2 ps-4 gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      {link.submenu!.map((sub) => (
                        <NavLink
                          key={sub.to}
                          to={sub.to}
                          onClick={() => setOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-2 text-meta tracking-wide text-right py-1.5 ${
                              isActive ? "text-accent" : "text-foreground hover:text-accent"
                            }`
                          }
                        >
                          <ArrowLeft
                            className="h-4 w-4 shrink-0 opacity-70"
                            aria-hidden="true"
                          />
                          {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
