import { ReactNode, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  FolderOpen,
  Settings,
  Inbox,
  FileText,
  LogOut,
  Image as ImageIcon,
  ExternalLink,
  Package,
  Crown,
  ClipboardList,
  Users,
  HelpCircle,
  Type,
  MessageSquare,
  Quote,
  type LucideIcon,
  Star,
  Layers,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const LEADS_SEEN_KEY = "aluma_admin_leads_seen_at";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: "leads";
};

/**
 * Grouped, because fourteen flat links is a list you read every time instead
 * of a shape you learn once. The groups answer three different questions:
 * what's on the site, who wrote to us, and how is this thing set up.
 */
const navGroups: { label: string | null; items: NavItem[] }[] = [
  {
    label: null,
    items: [{ to: "/admin", label: "מה בא לכם לעשות?", icon: HelpCircle, end: true }],
  },
  {
    label: "התוכן של האתר",
    items: [
      { to: "/admin/collections", label: "קולקציות ומוצרים", icon: Package },
      { to: "/admin/projects", label: "פרויקטים", icon: FolderOpen },
      { to: "/admin/materials", label: "חומרים", icon: Layers },
      { to: "/admin/hero", label: "תמונה ראשית", icon: ImageIcon },
      { to: "/admin/home", label: "מוצרים נבחרים", icon: Star },
      { to: "/admin/texts", label: "טקסטים באתר", icon: Type },
      { to: "/admin/faqs", label: "שאלות ותשובות", icon: MessageSquare },
      { to: "/admin/reviews", label: "המלצות לקוחות", icon: Quote },
      { to: "/admin/blog", label: "מגזין", icon: FileText },
    ],
  },
  {
    label: "מה שהגיע מהאתר",
    items: [
      { to: "/admin/leads", label: "פניות", icon: Inbox, badge: "leads" as const },
      { to: "/admin/orders", label: "הזמנות לקוחות", icon: ClipboardList },
      { to: "/admin/club", label: "חברי מועדון", icon: Crown },
      { to: "/admin/stats", label: "סטטיסטיקות", icon: BarChart3 },
    ],
  },
  {
    label: "הגדרות",
    items: [
      { to: "/admin/settings", label: "פרטי קשר וסיסמה", icon: Settings },
      { to: "/admin/team", label: "מי עוד מנהל", icon: Users },
    ],
  },
];

const navItems: NavItem[] = navGroups.flatMap((g) => g.items);

export type Crumb = { label: string; to?: string };

/**
 * Where a screen sits, for the trail at the top.
 *
 * The product editor and the product list are not in the sidebar under their
 * own names — they are reached THROUGH קולקציות ומוצרים — so the trail has to
 * be told, rather than matched on the address alone.
 */
const SECTION_FOR = (pathname: string): NavItem | undefined => {
  if (pathname.startsWith("/admin/products") || pathname.startsWith("/admin/collections")) {
    return navItems.find((i) => i.to === "/admin/collections");
  }
  return navItems
    .filter((i) => i.to !== "/admin")
    .find((i) => pathname === i.to || pathname.startsWith(i.to + "/"));
};

const AdminLayout = ({
  children,
  crumbs = [],
  /** Tables and charts want the full width; a form does not. */
  width = "normal",
}: {
  children: ReactNode;
  crumbs?: Crumb[];
  width?: "normal" | "wide";
}) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  // The landing screen IS the menu; a link back to it from itself is noise.
  const pathname = useLocation().pathname.replace(/\/$/, "");
  const onGuide = pathname === "/admin";
  const section = SECTION_FOR(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  // A menu left open over the screen you just moved to is a menu in the way.
  useEffect(() => setMenuOpen(false), [pathname]);
  const [newLeads, setNewLeads] = useState(0);

  useEffect(() => {
    const fetchNew = async () => {
      const seenAt = localStorage.getItem(LEADS_SEEN_KEY) || "1970-01-01T00:00:00Z";
      const [a, b] = await Promise.all([
        supabase
          .from("contact_leads")
          .select("id", { count: "exact", head: true })
          .gt("created_at", seenAt),
        supabase
          .from("questionnaire_responses")
          .select("id", { count: "exact", head: true })
          .gt("created_at", seenAt),
      ]);
      const count = (a.count ?? 0) + (b.count ?? 0);
      setNewLeads((prev) => (prev === count ? prev : count));
    };

    let t: number | null = null;
    const start = () => {
      if (t) return;
      fetchNew();
      t = window.setInterval(fetchNew, 30_000);
    };
    const stop = () => {
      if (t) {
        clearInterval(t);
        t = null;
      }
    };

    start();
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const showBadge = item.badge === "leads" && newLeads > 0;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          // Ink on a tint, plus a bar on the reading edge — the terracotta
          // fill made whichever screen you were on the loudest thing in the
          // room, every time. One row style now: the phone drawer holds the
          // same list rather than a squashed copy of it.
          `relative flex items-center gap-3 px-3 h-11 rounded-sm text-base transition-colors ${
            isActive
              ? "bg-foreground/[0.06] text-foreground font-medium before:absolute before:start-0 before:inset-y-2 before:w-[3px] before:rounded-full before:bg-foreground before:content-['']"
              : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
          }`
        }
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span>{item.label}</span>
        <span
          className={`mr-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-sm text-base font-semibold bg-accent text-accent-foreground transition-opacity ${
            showBadge ? "opacity-100" : "opacity-0"
          }`}
          aria-label={`${newLeads} פניות חדשות`}
          aria-hidden={!showBadge}
        >
          {newLeads}
        </span>
      </NavLink>
    );
  };

  return (
    // The CMS sits outside the language tree, so it carries its own
    // direction context. Radix will not pick it up from the dir attribute.
    <DirectionProvider dir="rtl">
    <div className="admin-theme min-h-dvh bg-background" dir="rtl">
      <div className="flex min-h-dvh">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-l border-border bg-secondary">
          <div className="px-6 py-6 border-b border-border">
            <p className="text-base tracking-[0.3em] text-muted-foreground uppercase">Aluma</p>
            <h2 className="mt-1 font-display text-xl text-foreground">ניהול האתר</h2>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {navGroups.map((group, i) => (
              <div key={group.label ?? "top"} className={i > 0 ? "mt-6" : ""}>
                {group.label && (
                  <h3 className="px-3 pb-2 text-base font-medium tracking-wide text-muted-foreground">
                    {group.label}
                  </h3>
                )}
                <div className="space-y-0.5">{group.items.map((item) => renderItem(item))}</div>
              </div>
            ))}
          </nav>

          <div className="border-t border-border px-3 py-4">
            {user?.email && (
              <div className="px-3 pb-3">
                <p className="text-base text-muted-foreground">מחוברים בתור</p>
                <p className="truncate text-base text-foreground" dir="ltr" title={user.email}>
                  {user.email}
                </p>
              </div>
            )}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center gap-3 rounded-sm px-3 text-base text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
            >
              <ExternalLink className="w-4 h-4" />
              <span>לראות את האתר</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex h-10 w-full items-center gap-3 rounded-sm px-3 text-base text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span>יציאה</span>
            </button>
          </div>
        </aside>

        {/* Phone: a bar with a real menu behind it.

            It used to be a single row of all twenty links, scrolled sideways
            at 12px — every screen in the panel hidden behind a swipe, with no
            grouping and nothing to say where you were. This is the same
            sidebar, in a drawer. */}
        <div className="md:hidden fixed top-0 inset-x-0 z-40 border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-11 items-center gap-2 rounded-sm px-3 text-base text-foreground hover:bg-foreground/[0.04]"
              aria-label="פתיחת התפריט"
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span>תפריט</span>
            </button>
            <h2 className="font-display text-lg">{section?.label ?? "ניהול האתר"}</h2>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <button
              type="button"
              aria-label="סגירת התפריט"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-foreground/40"
            />
            <nav className="absolute inset-y-0 start-0 flex w-[84%] max-w-xs flex-col bg-secondary shadow-luxury">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="font-display text-xl text-foreground">ניהול האתר</h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="סגירת התפריט"
                  className="grid h-11 w-11 place-items-center rounded-sm text-foreground hover:bg-foreground/[0.06]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-5">
                {navGroups.map((group, i) => (
                  <div key={group.label ?? "top"} className={i > 0 ? "mt-6" : ""}>
                    {group.label && (
                      <h3 className="px-3 pb-2 text-base font-medium text-muted-foreground">
                        {group.label}
                      </h3>
                    )}
                    <div className="space-y-0.5">{group.items.map((item) => renderItem(item))}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border px-3 py-4">
                <button
                  onClick={handleLogout}
                  className="flex h-11 w-full items-center gap-3 rounded-sm px-3 text-base text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span>יציאה</span>
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 min-w-0 pt-16 md:pt-0">
          <div
            className={`mx-auto w-full px-5 py-8 md:px-10 md:py-10 ${
              width === "wide" ? "max-w-[1400px]" : "max-w-5xl"
            }`}
          >
            {/* Where you are, and one click to anywhere above it. The panel
                had a single "back to the menu" link, which told you nothing
                about where "here" was. */}
            {!onGuide && (
              <nav aria-label="מיקום" className="mb-6 flex flex-wrap items-center gap-2 text-base">
                <NavLink
                  to="/admin"
                  end
                  className="rounded-sm px-2 py-1 -ms-2 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
                >
                  ניהול
                </NavLink>
                {section && (
                  <>
                    <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    {crumbs.length > 0 ? (
                      <NavLink
                        to={section.to}
                        end
                        className="rounded-sm px-2 py-1 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
                      >
                        {section.label}
                      </NavLink>
                    ) : (
                      <span className="px-2 py-1 text-foreground">{section.label}</span>
                    )}
                  </>
                )}
                {crumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    {crumb.to ? (
                      <NavLink
                        to={crumb.to}
                        className="rounded-sm px-2 py-1 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
                      >
                        {crumb.label}
                      </NavLink>
                    ) : (
                      <span className="px-2 py-1 text-foreground">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
    </DirectionProvider>
  );
};

export const markLeadsSeen = () => {
  try {
    localStorage.setItem(LEADS_SEEN_KEY, new Date().toISOString());
  } catch {
    /* ignore */
  }
};

export default AdminLayout;
