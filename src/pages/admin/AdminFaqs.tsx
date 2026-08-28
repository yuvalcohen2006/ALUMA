import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  published: boolean;
  sort_order: number;
};

const CATEGORIES = ["רכישה ואספקה", "חומרים ועמידות", "אחריות ושירות"];

/**
 * The Q&A, editable.
 *
 * Categories are a free-text field with suggestions rather than a fixed list:
 * the public page groups by whatever string it finds, in sort order, so
 * inventing a new heading is just typing one.
 */
const AdminFaqs = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("site_faqs")
      .select("id, question, answer, category, published, sort_order")
      .order("sort_order", { ascending: true });
    if (error) toast.error("לא הצלחנו לטעון את השאלות");
    setFaqs((data as Faq[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const patch = (id: string, changes: Partial<Faq>) =>
    setFaqs((list) => list.map((f) => (f.id === id ? { ...f, ...changes } : f)));

  const save = async (f: Faq) => {
    setBusy(true);
    const { error } = await supabase
      .from("site_faqs")
      .update({
        question: f.question,
        answer: f.answer,
        category: f.category,
        published: f.published,
        sort_order: f.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", f.id);
    setBusy(false);
    if (error) return toast.error("השמירה נכשלה");
    toast.success("נשמר");
  };

  const add = async () => {
    setBusy(true);
    const { error } = await supabase.from("site_faqs").insert({
      question: "שאלה חדשה",
      answer: "התשובה כאן.",
      category: CATEGORIES[0],
      published: false,
      // New rows land at the end rather than the top, so adding one never
      // reshuffles a list the client has already ordered.
      sort_order: (faqs.at(-1)?.sort_order ?? 0) + 10,
    });
    setBusy(false);
    if (error) return toast.error("לא הצלחנו להוסיף שאלה");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("למחוק את השאלה הזו?")) return;
    const { error } = await supabase.from("site_faqs").delete().eq("id", id);
    if (error) return toast.error("המחיקה נכשלה");
    setFaqs((list) => list.filter((f) => f.id !== id));
    toast.success("נמחק");
  };

  if (loading) return <p className="text-muted-foreground">טוען…</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">שאלות ותשובות</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            אלה השאלות שמופיעות בעמוד "שאלות ותשובות". שאלה שאינה מסומנת
            "מפורסם" לא תופיע באתר.
          </p>
        </div>
        <Button onClick={add} disabled={busy} className="shrink-0">
          <Plus className="w-4 h-4 ms-1" /> שאלה חדשה
        </Button>
      </div>

      <div className="mt-8 space-y-8">
        {faqs.map((f) => (
          <div key={f.id} className="border-b border-border pb-6">
            <Input
              value={f.question}
              onChange={(e) => patch(f.id, { question: e.target.value })}
              className="font-medium"
              aria-label="שאלה"
            />
            <Textarea
              rows={3}
              className="mt-3"
              value={f.answer}
              onChange={(e) => patch(f.id, { answer: e.target.value })}
              aria-label="תשובה"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Input
                list="faq-categories"
                value={f.category}
                onChange={(e) => patch(f.id, { category: e.target.value })}
                className="w-48"
                aria-label="קטגוריה"
              />
              <Input
                type="number"
                value={f.sort_order}
                onChange={(e) => patch(f.id, { sort_order: Number(e.target.value) })}
                className="w-24"
                aria-label="סדר"
              />
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={f.published}
                  onChange={(e) => patch(f.id, { published: e.target.checked })}
                />
                מפורסם
              </label>

              <Button size="sm" onClick={() => save(f)} disabled={busy}>
                שמירה
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => remove(f.id)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">מחיקה</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <datalist id="faq-categories">
        {CATEGORIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </div>
  );
};

export default AdminFaqs;
