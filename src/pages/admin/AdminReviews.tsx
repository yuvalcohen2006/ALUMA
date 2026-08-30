import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "./AdminLayout";

type Review = {
  id: string;
  quote: string;
  name: string;
  meta: string | null;
  published: boolean;
  sort_order: number;
};

/**
 * Customer recommendations.
 *
 * The section on the home page renders nothing at all while this table is
 * empty, so nothing here is urgent and nothing needs placeholder filling. The
 * warning at the top is deliberate and is the reason this screen exists rather
 * than the quotes living in code: this project shipped invented reviews once,
 * and publishing made-up named customers is deceptive advertising.
 */
const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("site_reviews")
      .select("id, quote, name, meta, published, sort_order")
      .order("sort_order", { ascending: true });
    if (error) toast.error("לא הצלחנו לטעון את ההמלצות");
    setReviews((data as Review[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const patch = (id: string, changes: Partial<Review>) =>
    setReviews((list) => list.map((r) => (r.id === id ? { ...r, ...changes } : r)));

  const save = async (r: Review) => {
    setBusy(true);
    const { error } = await supabase
      .from("site_reviews")
      .update({
        quote: r.quote,
        name: r.name,
        meta: r.meta,
        published: r.published,
        sort_order: r.sort_order,
      })
      .eq("id", r.id);
    setBusy(false);
    if (error) return toast.error("השמירה נכשלה");
    toast.success("נשמר");
  };

  const add = async () => {
    setBusy(true);
    const { error } = await supabase.from("site_reviews").insert({
      quote: "",
      name: "",
      meta: null,
      published: false,
      sort_order: (reviews.at(-1)?.sort_order ?? 0) + 10,
    });
    setBusy(false);
    if (error) return toast.error("לא הצלחנו להוסיף המלצה");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("למחוק את ההמלצה?")) return;
    const { error } = await supabase.from("site_reviews").delete().eq("id", id);
    if (error) return toast.error("המחיקה נכשלה");
    setReviews((list) => list.filter((r) => r.id !== id));
  };

  // Inside the shell: a bare loading line left the screen with no way out.
  if (loading)
    return (
      <AdminLayout>
        <p className="text-muted-foreground">טוען…</p>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">המלצות לקוחות</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ההמלצות מופיעות בתחתית דף הבית. כל עוד אין כאן המלצות מפורסמות,
            הקטע פשוט לא מופיע באתר — אין צורך למלא כלום בינתיים.
          </p>
        </div>
        <Button onClick={add} disabled={busy} className="shrink-0">
          <Plus className="w-4 h-4 ms-1" /> המלצה חדשה
        </Button>
      </div>

      <p className="mt-5 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm leading-relaxed text-foreground">
        <strong>חשוב:</strong> להוסיף כאן רק ציטוטים אמיתיים של לקוחות אמיתיים,
        שנתנו אישור לפרסם. פרסום המלצות מומצאות בשם של אנשים הוא פרסום מטעה.
      </p>

      <div className="mt-8 space-y-8">
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">אין עדיין המלצות.</p>
        )}

        {reviews.map((r) => (
          <div key={r.id} className="border-b border-border pb-6">
            <Textarea
              rows={3}
              value={r.quote}
              placeholder="מה הלקוח אמר"
              onChange={(e) => patch(r.id, { quote: e.target.value })}
              aria-label="ציטוט"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Input
                value={r.name}
                placeholder="שם"
                onChange={(e) => patch(r.id, { name: e.target.value })}
                className="w-40"
                aria-label="שם"
              />
              <Input
                value={r.meta ?? ""}
                placeholder="עיר או פרויקט"
                onChange={(e) => patch(r.id, { meta: e.target.value })}
                className="w-48"
                aria-label="פרטים"
              />
              <Input
                type="number"
                value={r.sort_order}
                onChange={(e) => patch(r.id, { sort_order: Number(e.target.value) })}
                className="w-20"
                aria-label="סדר"
              />
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={r.published}
                  onChange={(e) => patch(r.id, { published: e.target.checked })}
                />
                מפורסם
              </label>
              <Button
                size="sm"
                onClick={() => save(r)}
                disabled={busy || !r.quote.trim() || !r.name.trim()}
              >
                שמירה
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => remove(r.id)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">מחיקה</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
