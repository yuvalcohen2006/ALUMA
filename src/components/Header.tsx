import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import alumaLogo from "@/assets/aluma-logo.png";
import { useCollections } from "@/hooks/useCollectionsData";

const materialsSub = [
  { label: "בד Sunbrella", to: "/materials/sunbrella" },
  { label: "אלומיניום", to: "/materials/aluminum" },
  { label: "שיש גרניט פורצלן", to: "/materials/granite-porcelain" },
  { label: "PolyStone", to: "/materials/polystone" },
];

const diySub = [
  { label: "עצבו סלון", to: "/designer" },
  { label: "בחרו את הבד", to: "/fabric" },
  { label: "AR — תצוגה במרחב", to: "/ar" },
  { label: "שאלון חכם", to: "/questionnaire" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { collections } = useCollections();

  const collectionsSub = useMemo(
    () => [
      ...collections.map((c) => ({ label: c.name_he, to: `/collections#${c.slug}` })),
      { label: "כל הקולקציות", to: "/collections" },
    ],
    [collections]
  );

  const navLinks = useMemo(
    () => [
      { label: "דף הבית", to: "/" },
      { label: "הסיפור שלנו", to: "/story" },
      { label: "קולקציות", to: "/collections", submenu: collectionsSub, noLink: true },
      { label: "חומרים", to: "/materials", submenu: materialsSub },
      {
        label: "פרויקטים",
        to: "/projects",
        submenu: [
          { label: "כל הפרויקטים", to: "/projects" },
          { label: "לפני ואחרי", to: "/before-after" },
        ],
      },
      { label: "עשה זאת בעצמך", to: "/designer", submenu: diySub },
      { label: "מגזין", to: "/blog" },
      { label: "שאלות ותשובות", to: "/faq" },
      { label: "מועדון", to: "/club" },
      { label: "צרו קשר", to: "/contact" },
    ],
    [collectionsSub]
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
          : "bg-background/60 backdrop-blur-sm"
      }`}
    >
      <div dir="rtl" className="w-full px-4 lg:px-6 flex items-center h-24 gap-4">

        {/* Logo (right side in RTL) */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <Link to="/" aria-label="Aluma">
            <img src={alumaLogo} alt="Aluma" className="h-7 xl:h-8 w-auto" />
          </Link>
          <span className="block w-px h-8 bg-primary/50 shadow-[3px_0_0_0_hsl(var(--primary)/0.5)]" />
        </div>

        {/* Mobile logo */}
        <Link to="/" className="lg:hidden shrink-0 order-last" aria-label="Aluma">
          <img src={alumaLogo} alt="Aluma" className="h-7 md:h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-3 xl:gap-5 2xl:gap-7 whitespace-nowrap">
          {navLinks.map((link) => (
            <div key={link.to} className="relative group/item">
              {link.noLink ? (
                <span
                  className="text-[13px] xl:text-sm 2xl:text-base font-semibold tracking-wide text-primary hover:text-accent transition-smooth relative inline-flex items-center group cursor-default select-none"
                >
                  {link.label}
                  <span className="absolute -bottom-1.5 right-0 h-0.5 bg-accent transition-all duration-300 w-0 group-hover:w-full" />
                </span>
              ) : (
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `text-[13px] xl:text-sm 2xl:text-base font-semibold tracking-wide transition-smooth relative inline-flex items-center group ${
                      isActive ? "text-accent" : "text-primary hover:text-accent"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      <span
                        className={`absolute -bottom-1.5 right-0 h-0.5 bg-accent transition-all duration-300 ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              )}

              {link.submenu && (
                <div className="absolute top-full right-1/2 translate-x-1/2 pt-4 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-smooth z-50">
                  <div className="bg-background border border-border shadow-luxury rounded-sm min-w-[220px] py-2">
                    {link.submenu.map((sub) => (
                      <Link
                        key={sub.to}
                        to={sub.to}
                        className="block px-5 py-2.5 text-sm text-primary hover:text-accent hover:bg-secondary/40 transition-smooth text-right"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Tagline (only on wide screens) */}
        <div className="hidden 2xl:flex items-center gap-4 shrink-0">
          <span className="block w-px h-8 bg-primary/50 shadow-[3px_0_0_0_hsl(var(--primary)/0.5)]" />
          <div dir="ltr">
            <span className="text-[10px] tracking-[0.2em] uppercase text-primary font-medium border border-primary/70 rounded-sm px-3 py-1.5 whitespace-nowrap">
              Where outdoor becomes lifestyle
            </span>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden relative z-50 order-first me-auto">
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

      {/* Mobile menu — slide-in from right */}
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
            <Link to="/" onClick={() => setOpen(false)} aria-label="Aluma">
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
                    {link.noLink ? (
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : link.to)}
                        className="flex-1 font-display text-xl text-right py-3 text-primary hover:text-accent"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <NavLink
                        to={link.to}
                        end={link.to === "/"}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `flex-1 font-display text-xl text-right py-3 ${
                            isActive ? "text-accent" : "text-primary hover:text-accent"
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    )}
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
                              isActive ? "text-accent" : "text-primary/70 hover:text-accent"
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
                className="text-[9px] tracking-[0.2em] uppercase text-primary/70 whitespace-nowrap"
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
