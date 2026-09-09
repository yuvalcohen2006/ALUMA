import { useCallback, useEffect, useState } from "react";
import { Check, Package } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

/**
 * The three pieces on the home page.
 *
 * Before this screen the home strip was not chosen at all: it took the first
 * six published products ordered by sort_order, and sort_order is only ever
 * written as an index within a collection — so across the catalogue it is
 * mostly ties, Postgres broke them however it liked, and a brand-new product
 * (saved with sort_order 0) went straight to the front of the home page.
 *
 * Picking is click-to-toggle rather than three dropdowns. The owner is choosing
 * PHOTOGRAPHS, and a dropdown of 47 product names makes that a memory test.
 */

type Row = {
  id: string;
  name: string;
  cover_url: string | null;
  collection_id: string;
};

const MAX = 3;

const AdminHome = () => {
  const [products, setProducts] = useState<Row[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [initial, setInitial] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: cols }, { data: prods }, { data: highlights }] = await Promise.all([
      supabase.from("site_collections").select("id").eq("published", true),
      supabase
        .from("site_collection_products")
        .select("id, name, cover_url, collection_id")
        .eq("published", true)
        .order("name"),
      supabase.from("site_home_highlights").select("product_id, slot").order("slot"),
    ]);

    /*
     * Offer only what the home page can actually render.
     *
     * The site drops any product whose COLLECTION is hidden, and this screen
     * did not — so a piece inside a hidden collection could be picked, saved,
     * and then silently filtered out, leaving a strip of two with nothing in
     * the admin to explain it.
     */
    const visibleCollections = new Set(((cols as { id: string }[]) ?? []).map((c) => c.id));
    const rows = ((prods as Row[]) ?? []).filter((p) => visibleCollections.has(p.collection_id));

    /*
     * And reconcile the saved picks against that same list. A product that has
     * since been unpublished keeps its row in site_home_highlights, and its id
     * had no tile to click — so the counter read "2 of 3" while three slots
     * were taken, and there was no way to clear the third.
     */
    const live = new Set(rows.map((p) => p.id));
    const chosen = ((highlights as { product_id: string }[]) ?? [])
      .map((h) => h.product_id)
      .filter((id) => live.has(id));
    setProducts(rows);
    setPicked(chosen);
    setInitial(chosen);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (id: string) => {
    setPicked((current) => {
      if (current.includes(id)) return current.filter((x) => x !== id);
      if (current.length >= MAX) {
        toast.message(`אפשר לבחור ${MAX} מוצרים. הסירו אחד כדי להוסיף אחר.`);
        return current;
      }
      return [...current, id];
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      /* The old picks are read first so they can be put back.
         slot is `check (slot between 1 and 3)` and unique, so the new rows
         cannot be written alongside the old ones and the delete has to come
         first. What was missing is the undo: any failure on the insert — RLS,
         a dropped connection — left the table EMPTY, and the live home page
         lost its featured strip entirely until someone noticed and saved
         again. */
      const { data: previous, error: readErr } = await supabase
        .from("site_home_highlights")
        .select("product_id, slot");
      if (readErr) throw readErr;

      const { error: cleared } = await supabase
        .from("site_home_highlights")
        .delete()
        .not("product_id", "is", null);
      if (cleared) throw cleared;

      if (picked.length > 0) {
        const { error } = await supabase
          .from("site_home_highlights")
          .insert(picked.map((product_id, i) => ({ product_id, slot: i + 1 })));
        if (error) {
          if (previous && previous.length > 0) {
            await supabase.from("site_home_highlights").insert(previous);
          }
          throw error;
        }
      }

      setInitial(picked);
      toast.success("נשמר");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "השמירה נכשלה");
      load();
    } finally {
      setSaving(false);
    }
  };

  const dirty = picked.join(",") !== initial.join(",");

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl text-foreground">מוצרים נבחרים בדף הבית</h1>
          <Button onClick={save} disabled={saving || !dirty} size="lg">
            שמירה
          </Button>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          בחרו עד שלושה מוצרים. הם יופיעו בדף הבית בסדר שבחרתם, בגודל גדול. אם לא
          תבחרו כלום, האתר יציג שלושה מוצרים בעצמו.
        </p>

        {loading ? (
          <p className="mt-10 text-muted-foreground">טוען…</p>
        ) : (
          <ul
            role="list"
            className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4"
          >
            {products.map((p) => {
              const slot = picked.indexOf(p.id);
              const chosen = slot > -1;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    aria-pressed={chosen}
                    className="group block w-full text-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  >
                    <div
                      className={`relative aspect-square overflow-hidden rounded-sm bg-secondary transition-all ${
                        chosen
                          ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                          : "group-hover:opacity-90"
                      }`}
                    >
                      {p.cover_url ? (
                        <img
                          src={p.cover_url}
                          alt=""
                          loading="lazy"
                          className="h-full w-full bg-secondary object-contain"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}

                      {chosen && (
                        <span className="absolute end-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-foreground text-sm font-medium text-background">
                          {slot + 1}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-foreground">{p.name}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && picked.length > 0 && (
          <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <Check className="h-4 w-4" aria-hidden="true" />
            נבחרו {picked.length} מתוך {MAX}
          </p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminHome;
