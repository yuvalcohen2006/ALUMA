import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Shield, User as UserIcon, Heart, ClipboardList, Crown } from "lucide-react";

type Row = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  role: "admin" | "customer" | "editor" | null;
  favorites_count: number;
  projects_count: number;
};

const AdminClub = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [selDetails, setSelDetails] = useState<{ favorites: any[]; projects: any[] } | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }, { data: favs }, { data: projs }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("product_favorites").select("user_id"),
      supabase.from("customer_projects").select("user_id"),
    ]);

    const roleMap = new Map<string, Row["role"]>();
    (roles ?? []).forEach((r: any) => roleMap.set(r.user_id, r.role));
    const favCount = new Map<string, number>();
    (favs ?? []).forEach((f: any) => favCount.set(f.user_id, (favCount.get(f.user_id) ?? 0) + 1));
    const projCount = new Map<string, number>();
    (projs ?? []).forEach((p: any) => projCount.set(p.user_id, (projCount.get(p.user_id) ?? 0) + 1));

    setRows(
      (profiles ?? []).map((p: any) => ({
        ...p,
        role: roleMap.get(p.id) ?? null,
        favorites_count: favCount.get(p.id) ?? 0,
        projects_count: projCount.get(p.id) ?? 0,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        (r.full_name ?? "").toLowerCase().includes(s) ||
        (r.phone ?? "").includes(s) ||
        r.id.includes(s)
    );
  }, [rows, q]);

  const toggleAdmin = async (row: Row) => {
    if (row.role === "admin") {
      if (!confirm(`להוריד הרשאת אדמין מ-${row.full_name || row.id}?`)) return;
      const { error } = await supabase.from("user_roles").delete().eq("user_id", row.id).eq("role", "admin");
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: row.id, role: "admin" });
      if (error) return toast.error(error.message);
    }
    toast.success("עודכן");
    load();
  };

  const openDetails = async (row: Row) => {
    setSelected(row);
    setSelDetails(null);
    const [{ data: favorites }, { data: projects }] = await Promise.all([
      supabase
        .from("product_favorites")
        .select("product_id, created_at, site_collection_products(name, slug, cover_url)")
        .eq("user_id", row.id),
      supabase.from("customer_projects").select("*").eq("user_id", row.id).order("updated_at", { ascending: false }),
    ]);
    setSelDetails({ favorites: favorites ?? [], projects: projects ?? [] });
  };

  return (
    <AdminLayout>
      <header className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-foreground uppercase mb-1">Aluma Club</p>
          <h1 className="font-display text-3xl flex items-center gap-3">
            <Crown className="w-7 h-7 text-primary" />
            ניהול מועדון
          </h1>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש לפי שם / טלפון" className="pr-9" />
        </div>
      </header>

      {loading ? (
        <p className="text-muted-foreground">טוען…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">אין חברי מועדון להצגה.</p>
      ) : (
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs">
              <tr>
                <th className="text-right px-4 py-3">שם</th>
                <th className="text-right px-4 py-3">טלפון</th>
                <th className="text-right px-4 py-3">הצטרפות</th>
                <th className="text-right px-4 py-3">הזמנות</th>
                <th className="text-right px-4 py-3">מועדפים</th>
                <th className="text-right px-4 py-3">תפקיד</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{r.full_name || "—"}</td>
                  <td className="px-4 py-3" dir="ltr">{r.phone || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("he-IL")}
                  </td>
                  <td className="px-4 py-3">{r.projects_count}</td>
                  <td className="px-4 py-3">{r.favorites_count}</td>
                  <td className="px-4 py-3">
                    {r.role === "admin" ? (
                      <Badge variant="default" className="gap-1"><Shield className="w-3 h-3" />אדמין</Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1"><UserIcon className="w-3 h-3" />חבר מועדון</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => openDetails(r)}>פרטים</Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleAdmin(r)}>
                      {r.role === "admin" ? "הסר אדמין" : "הפוך לאדמין"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{selected?.full_name || "חבר מועדון"}</DialogTitle>
            <p className="text-sm text-muted-foreground">{selected?.phone}</p>
          </DialogHeader>
          {!selDetails ? (
            <p className="text-muted-foreground">טוען…</p>
          ) : (
            <div className="space-y-6">
              <section>
                <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> הזמנות ({selDetails.projects.length})
                </h3>
                {selDetails.projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">אין הזמנות</p>
                ) : (
                  <ul className="space-y-2">
                    {selDetails.projects.map((p: any) => (
                      <li key={p.id} className="border border-border rounded-sm p-3 text-sm">
                        <div className="flex justify-between">
                          <strong>{p.title}</strong>
                          <span className="text-xs text-muted-foreground">{p.status} · {p.progress}%</span>
                        </div>
                        {p.next_milestone && (
                          <p className="text-xs text-muted-foreground mt-1">אבן דרך: {p.next_milestone}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section>
                <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4" /> מועדפים ({selDetails.favorites.length})
                </h3>
                {selDetails.favorites.length === 0 ? (
                  <p className="text-sm text-muted-foreground">אין מועדפים</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selDetails.favorites.map((f: any) => (
                      <div key={f.product_id} className="border border-border rounded-sm overflow-hidden">
                        {f.site_collection_products?.cover_url && (
                          <img src={f.site_collection_products.cover_url} alt={f.site_collection_products?.name} className="w-full aspect-square object-cover" />
                        )}
                        <p className="p-2 text-xs">{f.site_collection_products?.name || "—"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminClub;
