import { useEffect, useState } from "react";
import { Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/admin-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Variant = {
  id: string;
  name: string;
  swatch: string | null;
  image_url: string | null;
  sort_order: number;
};

/**
 * The finishes for one product — the feature the client described as
 * "different photos of the furniture that toggle when the customer changes
 * colour".
 *
 * Each row is a colour: a name, the dot the visitor clicks, and the photograph
 * of this product in that finish. Selecting the swatch on the product page
 * swaps the lead image to this one.
 *
 * Rows save themselves as you go rather than joining the parent form's save,
 * because they belong to a different table and a half-saved product with
 * orphaned finishes is worse than a couple of extra round trips.
 */
const ProductFinishes = ({ productId }: { productId: string }) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("product_variants")
      .select("id, name, swatch, image_url, sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });
    setVariants((data as Variant[]) ?? []);
  };

  useEffect(() => {
    if (productId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const add = async () => {
    setBusy(true);
    const { error } = await supabase.from("product_variants").insert({
      product_id: productId,
      name: "גימור חדש",
      swatch: "#cbbba4",
      sort_order: (variants.at(-1)?.sort_order ?? 0) + 10,
    });
    setBusy(false);
    if (error) return toast.error("לא הצלחנו להוסיף גימור");
    load();
  };

  const patch = (id: string, changes: Partial<Variant>) =>
    setVariants((list) => list.map((v) => (v.id === id ? { ...v, ...changes } : v)));

  const save = async (v: Variant) => {
    setBusy(true);
    const { error } = await supabase
      .from("product_variants")
      .update({
        name: v.name,
        swatch: v.swatch,
        image_url: v.image_url,
        sort_order: v.sort_order,
      })
      .eq("id", v.id);
    setBusy(false);
    if (error) return toast.error("השמירה נכשלה");
    toast.success("הגימור נשמר");
  };

  const remove = async (id: string) => {
    if (!confirm("למחוק את הגימור?")) return;
    const { error } = await supabase.from("product_variants").delete().eq("id", id);
    if (error) return toast.error("המחיקה נכשלה");
    setVariants((list) => list.filter((v) => v.id !== id));
  };

  const upload = async (v: Variant, file: File) => {
    setBusy(true);
    try {
      const { url } = await uploadFile("site-collections", file);
      patch(v.id, { image_url: url });
      await supabase.from("product_variants").update({ image_url: url }).eq("id", v.id);
      toast.success("התמונה הועלתה");
    } catch {
      toast.error("העלאת התמונה נכשלה");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label>גימורים</Label>
        <Button type="button" size="sm" variant="outline" onClick={add} disabled={busy}>
          <Plus className="w-4 h-4 ms-1" /> גימור חדש
        </Button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        כל גימור מופיע כעיגול צבע בעמוד המוצר. לחיצה עליו מחליפה את תמונת המוצר.
      </p>

      <div className="mt-3 space-y-3">
        {variants.length === 0 && (
          <p className="text-xs text-muted-foreground">אין גימורים למוצר הזה.</p>
        )}

        {variants.map((v) => (
          <div key={v.id} className="flex flex-wrap items-center gap-2 border border-border rounded p-2">
            <div className="relative w-14 h-14 shrink-0">
              {v.image_url ? (
                <img src={v.image_url} alt="" className="w-full h-full object-cover rounded" />
              ) : (
                <label className="w-full h-full border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:bg-muted">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && upload(v, e.target.files[0])}
                  />
                </label>
              )}
              {v.image_url && (
                <button
                  type="button"
                  onClick={() => patch(v.id, { image_url: null })}
                  className="absolute top-0 left-0 bg-destructive text-destructive-foreground rounded-sm p-0.5"
                  aria-label="הסרת תמונה"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <Input
              value={v.name}
              onChange={(e) => patch(v.id, { name: e.target.value })}
              className="w-32"
              aria-label="שם הגימור"
            />
            <input
              type="color"
              value={v.swatch ?? "#cbbba4"}
              onChange={(e) => patch(v.id, { swatch: e.target.value })}
              className="h-9 w-12 rounded border border-border bg-background"
              aria-label="צבע העיגול"
            />
            <Input
              type="number"
              value={v.sort_order}
              onChange={(e) => patch(v.id, { sort_order: Number(e.target.value) })}
              className="w-20"
              aria-label="סדר"
            />
            <Button type="button" size="sm" onClick={() => save(v)} disabled={busy}>
              שמירה
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => remove(v.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductFinishes;
