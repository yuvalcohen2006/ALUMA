import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SiteText = {
  key: string;
  value: string;
  label: string;
  hint: string | null;
  multiline: boolean;
  sort_order: number;
};

/**
 * Editable copy.
 *
 * Every row is a piece of text that appears somewhere on the public site,
 * labelled by where it appears rather than by its key — whoever edits this
 * should never need to know that the field is called "home.statement.lead".
 *
 * Clearing a field is safe: the components fall back to the wording they ship
 * with, so an empty box restores the default rather than blanking a section.
 * That is worth knowing while editing, so the page says it.
 */
const AdminTexts = () => {
  const [rows, setRows] = useState<SiteText[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_texts")
        .select("key, value, label, hint, multiline, sort_order")
        .order("sort_order", { ascending: true });
      if (error) toast.error("לא הצלחנו לטעון את הטקסטים");
      const list = (data as SiteText[]) ?? [];
      setRows(list);
      setDraft(Object.fromEntries(list.map((r) => [r.key, r.value])));
      setLoading(false);
    })();
  }, []);

  const save = async (key: string) => {
    setSaving(key);
    const { error } = await supabase
      .from("site_texts")
      .update({ value: draft[key] ?? "", updated_at: new Date().toISOString() })
      .eq("key", key);
    setSaving(null);
    if (error) {
      toast.error("השמירה נכשלה");
      return;
    }
    toast.success("נשמר. רעננו את האתר כדי לראות את השינוי.");
  };

  if (loading) return <p className="text-muted-foreground">טוען…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-foreground">טקסטים באתר</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        כל שדה כאן הוא טקסט שמופיע באתר. אפשר לערוך ולשמור כל אחד בנפרד.
        השארתם שדה ריק? האתר יחזור לנוסח המקורי — אי אפשר לשבור שום דבר מכאן.
      </p>

      <div className="mt-8 space-y-8">
        {rows.map((r) => (
          <div key={r.key} className="border-b border-border pb-6">
            <label className="block text-sm font-medium text-foreground" htmlFor={r.key}>
              {r.label}
            </label>
            {r.hint && <p className="mt-1 text-xs text-muted-foreground">{r.hint}</p>}

            {r.multiline ? (
              <Textarea
                id={r.key}
                rows={4}
                className="mt-3"
                value={draft[r.key] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [r.key]: e.target.value }))}
              />
            ) : (
              <Input
                id={r.key}
                className="mt-3"
                value={draft[r.key] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [r.key]: e.target.value }))}
              />
            )}

            <Button
              size="sm"
              className="mt-3"
              disabled={saving === r.key || draft[r.key] === r.value}
              onClick={() => save(r.key)}
            >
              {saving === r.key ? "שומר…" : "שמירה"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTexts;
