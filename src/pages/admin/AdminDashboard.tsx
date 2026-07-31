import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Globe, MousePointerClick, Eye, Users, RefreshCw, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Link } from "react-router-dom";

const RANGES = [
  { key: "today", label: "היום", days: 0 },
  { key: "yesterday", label: "אתמול", days: 1 },
  { key: "7d", label: "7 ימים", days: 7 },
  { key: "30d", label: "30 יום", days: 30 },
  { key: "90d", label: "90 יום", days: 90 },
  { key: "month", label: "החודש", days: -1 },
  { key: "prev", label: "חודש קודם", days: -2 },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];


function rangeBounds(key: RangeKey): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);
  if (key === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (key === "yesterday") {
    start = new Date(now); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() - 1); end.setHours(23, 59, 59, 999);
  } else if (key === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (key === "prev") {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end.setFullYear(now.getFullYear(), now.getMonth(), 0); end.setHours(23, 59, 59, 999);
  } else {
    const days = RANGES.find((r) => r.key === key)?.days ?? 30;
    start = new Date(now.getTime() - days * 86400_000);
  }
  const span = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(start.getTime() - span);
  return { start, end, prevStart, prevEnd };
}

type Stats = {
  pageViews: number;
  uniqueVisitors: number;
  viewsPerVisitor: number;
  total: number;
  live: number;
  prevPageViews: number;
  prevUniqueVisitors: number;
};

type Project = { slug: string; title: string; cover_url: string | null };

const AdminDashboard = () => {
  const [range, setRange] = useState<RangeKey>("30d");
  const [stats, setStats] = useState<Stats>({
    pageViews: 0, uniqueVisitors: 0, viewsPerVisitor: 0, total: 0, live: 0,
    prevPageViews: 0, prevUniqueVisitors: 0,
  });
  const [livePath, setLivePath] = useState<string>("");
  const [series, setSeries] = useState<{ date: string; views: number; visitors: number }[]>([]);
  const [topPaths, setTopPaths] = useState<{ path: string; views: number; visitors: number }[]>([]);
  const [topSources, setTopSources] = useState<{ source: string; count: number }[]>([]);
  const [topProjects, setTopProjects] = useState<(Project & { views: number; rank: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const bounds = useMemo(() => rangeBounds(range), [range]);
  const dateLabel = useMemo(() => {
    const fmt = (d: Date) => d.toLocaleDateString("he-IL", { day: "numeric", month: "numeric", year: "numeric" });
    return `${fmt(bounds.start)} – ${fmt(bounds.end)}`;
  }, [bounds]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const dLive = new Date(Date.now() - 3 * 60_000);

      const [viewsRows, prevRows, totalC, liveRows, leadsAndProjects] = await Promise.all([
        supabase
          .from("page_views")
          .select("created_at,path,referrer,session_id,project_slug")
          .gte("created_at", bounds.start.toISOString())
          .lte("created_at", bounds.end.toISOString())
          .order("created_at"),
        supabase
          .from("page_views")
          .select("session_id,id", { count: "exact" })
          .gte("created_at", bounds.prevStart.toISOString())
          .lte("created_at", bounds.prevEnd.toISOString()),
        supabase.from("page_views").select("id", { count: "exact", head: true }),
        supabase
          .from("active_sessions")
          .select("session_id,path")
          .gte("last_seen", dLive.toISOString()),
        supabase.from("site_projects").select("slug,title,cover_url"),
      ]);

      if (cancelled) return;

      const rows = (viewsRows.data as any[]) || [];
      const sessions = new Set<string>();
      const buckets = new Map<string, { views: number; visitors: Set<string> }>();
      const pathMap = new Map<string, { views: number; visitors: Set<string> }>();
      const sourceMap = new Map<string, number>();
      const projectMap = new Map<string, number>();

      // Build empty buckets
      const days = Math.max(1, Math.ceil((bounds.end.getTime() - bounds.start.getTime()) / 86400_000));
      for (let i = 0; i < Math.min(days, 90); i++) {
        const d = new Date(bounds.start.getTime() + i * 86400_000);
        buckets.set(d.toISOString().slice(0, 10), { views: 0, visitors: new Set() });
      }

      rows.forEach((r) => {
        if (r.session_id) sessions.add(r.session_id);
        const k = (r.created_at as string).slice(0, 10);
        if (!buckets.has(k)) buckets.set(k, { views: 0, visitors: new Set() });
        const b = buckets.get(k)!;
        b.views += 1;
        if (r.session_id) b.visitors.add(r.session_id);

        const path = (r.path as string) || "/";
        if (!pathMap.has(path)) pathMap.set(path, { views: 0, visitors: new Set() });
        const p = pathMap.get(path)!;
        p.views += 1;
        if (r.session_id) p.visitors.add(r.session_id);

        const ref = (r.referrer as string) || "";
        let src = "ישיר";
        if (ref) {
          try {
            const u = new URL(ref);
            const h = u.hostname.replace(/^www\./, "");
            if (/facebook|instagram|fb\.com/.test(h)) src = "Facebook/Instagram";
            else if (/google/.test(h)) src = "Google";
            else if (h === window.location.hostname) src = "פנימי";
            else src = h;
          } catch {
            src = "ישיר";
          }
        }
        sourceMap.set(src, (sourceMap.get(src) || 0) + 1);

        if (r.project_slug) {
          projectMap.set(r.project_slug, (projectMap.get(r.project_slug) || 0) + 1);
        }
      });

      // Prev period unique visitors
      const prevSessions = new Set<string>();
      ((prevRows.data as any[]) || []).forEach((r) => r.session_id && prevSessions.add(r.session_id));

      setSeries(
        Array.from(buckets, ([date, b]) => ({
          date: date.slice(5),
          views: b.views,
          visitors: b.visitors.size,
        }))
      );

      const pageViews = rows.length;
      const uniqueVisitors = sessions.size;

      setStats({
        pageViews,
        uniqueVisitors,
        viewsPerVisitor: uniqueVisitors ? +(pageViews / uniqueVisitors).toFixed(2) : 0,
        total: totalC.count ?? pageViews, // all-time page views (distinct from the range-scoped card)
        live: (liveRows.data || []).length,
        prevPageViews: prevRows.count || 0,
        prevUniqueVisitors: prevSessions.size,
      });

      const liveByPath = new Map<string, number>();
      ((liveRows.data as any[]) || []).forEach((r) => {
        liveByPath.set(r.path || "/", (liveByPath.get(r.path || "/") || 0) + 1);
      });
      const topLive = Array.from(liveByPath.entries()).sort((a, b) => b[1] - a[1])[0];
      setLivePath(topLive ? topLive[0] : "");

      setTopPaths(
        Array.from(pathMap, ([path, b]) => ({ path, views: b.views, visitors: b.visitors.size }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10)
      );

      setTopSources(
        Array.from(sourceMap, ([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)
      );

      const projects = (leadsAndProjects.data as Project[]) || [];
      const projectsBySlug = new Map(projects.map((p) => [p.slug, p]));
      setTopProjects(
        Array.from(projectMap, ([slug, views]) => ({ slug, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 6)
          .map((p, i) => ({
            slug: p.slug,
            views: p.views,
            rank: i + 1,
            title: projectsBySlug.get(p.slug)?.title || p.slug,
            cover_url: projectsBySlug.get(p.slug)?.cover_url || null,
          }))
      );

      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [bounds, refreshKey]);

  const pathLabel = (p: string) => {
    if (p === "/") return "דף הבית";
    if (p === "/projects") return "פרויקטים";
    if (p === "/contact") return "יצירת קשר";
    if (p === "/materials") return "חומרים";
    if (p === "/privacy") return "מדיניות פרטיות";
    if (p === "/diy/scene") return "מעצב";
    if (p.startsWith("/projects/")) return `פרויקט: ${decodeURIComponent(p.replace("/projects/", ""))}`;
    return p;
  };

  const pctDelta = (cur: number, prev: number) => {
    if (!prev) return cur ? 100 : 0;
    return Math.round(((cur - prev) / prev) * 100);
  };

  const viewsDelta = pctDelta(stats.pageViews, stats.prevPageViews);
  const visitorsDelta = pctDelta(stats.uniqueVisitors, stats.prevUniqueVisitors);

  const maxPath = Math.max(1, ...topPaths.map((p) => p.views));
  const maxSource = Math.max(1, ...topSources.map((s) => s.count));

  return (
    <AdminLayout>
      {/* Live banner */}
      <section className="rounded-2xl border border-primary/20 bg-gradient-to-l from-primary/5 via-primary/10 to-primary/5 px-8 py-6 mb-8">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-foreground text-sm mb-1">
              באתר עכשיו
            </div>
            <div className="font-display text-5xl text-foreground tabular-nums">{stats.live.toLocaleString("en-US")}</div>
            <p className="text-xs text-muted-foreground mt-1">מבקר פעיל ב-3 הדקות האחרונות</p>
          </div>
          <div className="text-center flex-1 min-w-[180px]">
            <p className="text-sm text-muted-foreground mb-1">עמודים פעילים כעת</p>
            <p className="text-lg text-foreground">{livePath ? pathLabel(livePath) : "—"}</p>
          </div>
          <div className="flex items-center justify-center w-14 h-14 rounded-sm bg-primary/15 text-primary">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Range pills */}
      <div className="rounded-2xl border border-border bg-card px-4 py-3 mb-8 flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="inline-flex items-center gap-2 text-sm border border-border rounded-sm px-4 py-2 hover:bg-muted"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          רענן
        </button>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {RANGES.map((r) => {
            const active = r.key === range;
            return (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`text-sm px-4 py-1.5 rounded-sm transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label='סה"כ צפיות' value={stats.total} icon={Globe} loading={loading} />
        <StatCard label="צפיות למבקר" value={stats.viewsPerVisitor} icon={MousePointerClick} loading={loading} decimal />
        <StatCard
          label="צפיות בעמודים"
          value={stats.pageViews}
          icon={Eye}
          loading={loading}
          delta={viewsDelta}
        />
        <StatCard
          label="מבקרים ייחודיים"
          value={stats.uniqueVisitors}
          icon={Users}
          loading={loading}
          delta={visitorsDelta}
        />
      </div>

      {/* Trend chart */}
      <section className="rounded-2xl border border-border bg-card p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-primary" />
              צפיות
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-muted-foreground/50" />
              מבקרים
            </span>
          </div>
          <div className="text-right">
            <h2 className="font-display text-2xl text-foreground">מגמת תנועה</h2>
            <p className="text-sm text-muted-foreground">צפיות לפי יום</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={32} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gViews)" />
              <Area type="monotone" dataKey="visitors" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Top pages + sources */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 text-right">
            <h2 className="font-display text-2xl text-foreground">העמודים הנצפים ביותר</h2>
            <p className="text-xs text-muted-foreground mt-1">{dateLabel}</p>
          </div>
          {topPaths.length === 0 ? (
            <p className="text-muted-foreground text-sm">אין נתונים עדיין.</p>
          ) : (
            <ul className="space-y-3">
              {topPaths.map((p) => {
                const w = (p.views / maxPath) * 100;
                return (
                  <li key={p.path}>
                    <div className="flex items-baseline justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground text-xs">
                        <span className="text-foreground font-medium">{p.views}</span> · {p.visitors} מבקרים
                      </span>
                      <span className="text-foreground truncate max-w-[60%]">{pathLabel(p.path)}</span>
                    </div>
                    <div className="h-1 bg-muted rounded-sm overflow-hidden" dir="ltr">
                      <div className="h-full bg-foreground/80 float-right" style={{ width: `${w}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 text-right">
            <h2 className="font-display text-2xl text-foreground">מקורות תנועה</h2>
            <p className="text-xs text-muted-foreground mt-1">מאיפה הגיעו המבקרים</p>
          </div>
          {topSources.length === 0 ? (
            <p className="text-muted-foreground text-sm">אין נתונים עדיין.</p>
          ) : (
            <ul className="space-y-3">
              {topSources.map((s) => {
                const w = (s.count / maxSource) * 100;
                return (
                  <li key={s.source}>
                    <div className="flex items-baseline justify-between text-sm mb-1.5">
                      <span className="text-foreground font-medium">{s.count}</span>
                      <span className="text-foreground truncate max-w-[70%]">{s.source}</span>
                    </div>
                    <div className="h-1 bg-muted rounded-sm overflow-hidden" dir="ltr">
                      <div className="h-full bg-primary float-right" style={{ width: `${w}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Top projects grid */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 text-right">
          <h2 className="font-display text-2xl text-foreground">הפרויקטים הנצפים ביותר</h2>
          <p className="text-xs text-muted-foreground mt-1">{dateLabel}</p>
        </div>
        {topProjects.length === 0 ? (
          <p className="text-muted-foreground text-sm">אין נתונים עדיין.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topProjects.map((p) => (
              <Link
                to={`/projects/${p.slug}`}
                key={p.slug}
                className="group rounded-xl border border-border overflow-hidden bg-background hover:shadow-soft transition-all"
              >
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  {p.cover_url ? (
                    <img
                      src={p.cover_url}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      ללא תמונה
                    </div>
                  )}
                  <span className="absolute bottom-3 left-3 bg-background/95 text-foreground text-xs font-medium px-3 py-1 rounded-sm">
                    #{p.rank}
                  </span>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-foreground font-medium tabular-nums">{p.views}</span>
                  <span className="text-foreground truncate">{p.title}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
};

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  delta,
  decimal,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
  delta?: number;
  decimal?: boolean;
}) {
  const display = loading
    ? "—"
    : decimal
      ? value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : value.toLocaleString("en-US");
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between mb-6">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground text-right">{label}</span>
      </div>
      <div className="text-right">
        <div className="font-display text-4xl text-foreground tracking-tight">{display}</div>
        {typeof delta === "number" && !loading && (
          <div
            className={`inline-flex items-center gap-1 mt-2 text-xs px-2 py-0.5 rounded-sm ${
              delta >= 0 ? "bg-primary/10 text-foreground" : "bg-red-100 text-red-700"
            }`}
          >
            <TrendingUp className={`w-3 h-3 ${delta < 0 ? "rotate-180" : ""}`} />
            {delta >= 0 ? "+" : ""}{delta}% מהתקופה הקודמת
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
