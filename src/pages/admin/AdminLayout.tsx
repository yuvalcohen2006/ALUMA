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

// Ordered by how often someone actually needs it, not by how the database is
// organised. The guide sits first because it is where /admin lands and where
// anyone unsure should start.
const navItems = [
  { to: "/admin", label: "מדריך", icon: HelpCircle, end: true },
  { to: "/admin/collections", label: "קולקציות ומוצרים", icon: Package },
  { to: "/admin/projects", label: "פרויקטים", icon: FolderOpen },
  { to: "/admin/texts", label: "טקסטים באתר", icon: Type },
  { to: "/admin/faqs", label: "שאלות ותשובות", icon: MessageSquare },
  { to: "/admin/reviews", label: "המלצות לקוחות", icon: Quote },
  { to: "/admin/hero", label: "תמונה ראשית", icon: ImageIcon },
  { to: "/admin/leads", label: "פניות", icon: Inbox, badge: "leads" as const },
  { to: "/admin/club", label: "ניהול מועדון", icon: Crown },
  { to: "/admin/orders", label: "הזמנות לקוחות", icon: ClipboardList },
  { to: "/admin/blog", label: "מגזין", icon: FileText },
  { to: "/admin/team", label: "חברי צוות", icon: Users },
  { to: "/admin/stats", label: "סטטיסטיקות", icon: BarChart3 },
  { to: "/admin/settings", label: "הגדרות אתר", icon: Settings },
];

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
            ? `flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs whitespace-nowrap transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`
            : `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
    <div className="min-h-dvh bg-muted/40" dir="rtl">
      <div className="flex min-h-dvh">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-l border-border bg-card">
          <div className="px-6 py-7 border-b border-border">
            <p className="text-[10px] tracking-[0.3em] text-foreground uppercase mb-1">
              Aluma Admin
            </p>
            <h2 className="font-display text-2xl text-foreground">לוח בקרה</h2>
          </div>

          <nav className="flex-1 px-3 py-5 space-y-1">
            {navItems.map((item) => renderItem(item))}
          </nav>

          <div className="px-3 py-4 border-t border-border space-y-1">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>צפייה באתר</span>
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>התנתק</span>
            </button>
            {user?.email && (
              <div className="px-3 pt-3 text-[11px] text-muted-foreground truncate" title={user.email}>
                {user.email}
              </div>
            )}
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
            <h2 className="font-display text-lg">לוח בקרה</h2>
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
