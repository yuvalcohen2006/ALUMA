import { ReactNode, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const LEADS_SEEN_KEY = "aluma_admin_leads_seen_at";

/**
 * Grouped, because fourteen flat links is a list you read every time instead
 * of a shape you learn once. The groups answer three different questions:
 * what's on the site, who wrote to us, and how is this thing set up.
 */
const navGroups = [
  {
    label: null,
    items: [{ to: "/admin", label: "מה בא לכם לעשות?", icon: HelpCircle, end: true }],
  },
  {
    label: "התוכן של האתר",
    items: [
      { to: "/admin/collections", label: "קולקציות ומוצרים", icon: Package },
      { to: "/admin/projects", label: "פרויקטים", icon: FolderOpen },
      { to: "/admin/hero", label: "תמונה ראשית", icon: ImageIcon },
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

const navItems = navGroups.flatMap((g) => g.items);

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
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

  const renderItem = (item: (typeof navItems)[number], mobile = false) => {
    const Icon = item.icon;
    const showBadge = item.badge === "leads" && newLeads > 0;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          mobile
            ? `flex items-center gap-1.5 px-3 h-9 rounded-sm text-xs whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              }`
            // Ink on a tint, plus a bar on the reading edge — the terracotta
            // fill made whichever screen you were on the loudest thing in the
            // room, every time.
            : `relative flex items-center gap-3 px-3 h-10 rounded-sm text-sm transition-colors ${
                isActive
                  ? "bg-foreground/[0.06] text-foreground font-medium before:absolute before:inset-inline-start-0 before:inset-block-2 before:w-[3px] before:rounded-full before:bg-foreground before:content-['']"
                  : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
              }`
        }
      >
        <Icon className={mobile ? "w-3.5 h-3.5" : "w-4 h-4 shrink-0"} />
        <span>{item.label}</span>
        <span
          className={`mr-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-sm text-[10px] font-semibold bg-accent text-accent-foreground transition-opacity ${
            showBadge ? "opacity-100" : "opacity-0"
          } ${mobile ? "ml-1" : ""}`}
          aria-label={`${newLeads} פניות חדשות`}
          aria-hidden={!showBadge}
        >
          {newLeads}
        </span>
      </NavLink>
    );
  };

  return (
    <div className="min-h-dvh bg-secondary/40" dir="rtl">
      <div className="flex min-h-dvh">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-l border-border bg-card">
          <div className="px-6 py-6 border-b border-border">
            <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Aluma</p>
            <h2 className="mt-1 font-display text-xl text-foreground">ניהול האתר</h2>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {navGroups.map((group, i) => (
              <div key={group.label ?? "top"} className={i > 0 ? "mt-6" : ""}>
                {group.label && (
                  <h3 className="px-3 pb-2 text-[11px] font-medium tracking-wide text-muted-foreground/70">
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
                <p className="text-[11px] text-muted-foreground">מחוברים בתור</p>
                <p className="truncate text-[13px] text-foreground" dir="ltr" title={user.email}>
                  {user.email}
                </p>
              </div>
            )}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center gap-3 rounded-sm px-3 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
            >
              <ExternalLink className="w-4 h-4" />
              <span>לראות את האתר</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex h-10 w-full items-center gap-3 rounded-sm px-3 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span>יציאה</span>
            </button>
          </div>
        </aside>

        {/* Mobile top nav */}
        <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-card border-b border-border">
          <div className="flex items-center justify-between px-4 h-14">
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
              aria-label="התנתק"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <h2 className="font-display text-lg">ניהול האתר</h2>
          </div>
          <div className="flex overflow-x-auto gap-1 px-2 pb-2">
            {navItems.map((item) => renderItem(item, true))}
          </div>
        </div>

        {/* Main */}
        <main className="flex-1 min-w-0 pt-28 md:pt-0">
          <div className="px-5 md:px-10 py-8 md:py-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
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
