import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, Loader2, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "./AdminLayout";
import ProductFinishes, { DEFAULT_VARIANT } from "./ProductFinishes";
import {
  BufferedInput,
  BufferedTextarea,
  emptyProduct,
  slugify,
  type Product,
} from "./catalogue-shared";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/admin-storage";
import { useCrop } from "@/components/admin/CropProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import PhotoSpec from "@/components/admin/PhotoSpec";
import { formatPrice, parsePriceInput } from "@/lib/price";
import { contentDirection } from "@/lib/field-direction";
import { planVariantSync, type DraftVariant } from "@/lib/variant-sync";
import Ltr from "@/components/Ltr";
import { ACCEPT_ATTRIBUTE } from "@/lib/photo-specs";

type Collection = { id: string; name_he: string };

/**
 * One piece of furniture, on a page of its own.
 *
 * It used to be a dialog stacked on top of the catalogue. A product carries a
 * name, a tagline, three list fields, dimensions, a price, a cover, a gallery
 * and its colours — far too much for a box that covers the very list you were
 * reading to decide what to change. Shopify, Contentful and Webflow all route
 * this to a full page for the same reason, and a modal additionally blocks
 * everything behind it while it is open.
 *
 * Two columns: what the product IS on the left, what is true ABOUT it on the
 * right. Status, its collection and the destructive action live in the narrow
 * column; nothing there changes the product's content.
 */
const AdminProductEdit = () => {
  const requestCrop = useCrop();
  const { id } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const isNew = id === "new";

  const [product, setProduct] = useState<Partial<Product> | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [variants, setVariants] = useState<DraftVariant[]>([]);
  const [savedVariants, setSavedVariants] = useState<(DraftVariant & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: cols } = await supabase
      .from("site_collections")
      .select("id, name_he")
      .order("sort_order");
    setCollections((cols as Collection[]) ?? []);

    if (isNew) {
      setProduct({
        ...emptyProduct,
        collection_id: params.get("collection") ?? (cols?.[0]?.id as string) ?? "",
      });
      setVariants([{ ...DEFAULT_VARIANT }]);
      setSavedVariants([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("site_collection_products")
      .select("*")
      .eq("id", id!)
      .maybeSingle();
    setProduct((data as Partial<Product>) ?? null);

    const { data: vs } = await supabase
      .from("product_variants")
      .select("id, name, swatch, image_url")
      .eq("product_id", id!)
      .order("sort_order", { ascending: true });
    const rows = (vs ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      swatch: v.swatch ?? "#cbbba4",
      image_url: v.image_url,
    }));
    setSavedVariants(rows);
    setVariants(rows.map((r) => ({ ...r })));
    setLoading(false);
  }, [id, isNew, params]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (changes: Partial<Product>) =>
    setProduct((p) => (p ? { ...p, ...changes } : p));

  const uploadCover = async (file: File) => {
    const cropped = await requestCrop(file, "product");
    if (!cropped) return;
    setUploading(true);
    try {
      const { url } = await uploadFile("site-collections", cropped);
      patch({ cover_url: url });
    } catch {
      toast.error("העלאת התמונה נכשלה");
    } finally {
      setUploading(false);
    }
  };

  const uploadGallery = async (files: FileList) => {
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        // One dialog per file, in order. Cancelling stops the rest rather than
        // skipping one, and keeps whatever was already cropped — throwing away
        // finished work to honour a cancel is the wrong reading of it.
        const cropped = await requestCrop(f, "product");
        if (!cropped) break;
        const { url } = await uploadFile("site-collections", cropped);
        urls.push(url);
      }
      patch({ gallery: [...((product?.gallery as string[]) ?? []), ...urls] });
    } catch {
      toast.error("העלאת התמונות נכשלה");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!product) return;
    if (!product.name?.trim()) return toast.error("צריך שם למוצר");
    if (!product.collection_id) return toast.error("צריך לבחור קולקציה");

    setSaving(true);
    const payload = {
      collection_id: product.collection_id,
      slug: product.id ? product.slug! : slugify(product.name),
      name: product.name,
      tag: product.tag || null,
      tagline: product.tagline || null,
      description: product.description || [],
      highlights: product.highlights || [],
      materials: product.materials || [],
      dimensions: product.dimensions || null,
      cover_url: product.cover_url || null,
      gallery: product.gallery || [],
      price: product.price ?? null,
      price_note: product.price_note || null,
      sort_order: product.sort_order ?? 0,
      published: product.published ?? true,
    };

    let productId = product.id;
    if (productId) {
      const { error } = await supabase
        .from("site_collection_products")
        .update(payload)
        .eq("id", productId);
      if (error) {
        setSaving(false);
        return toast.error(error.message);
      }
    } else {
      const { data, error } = await supabase
        .from("site_collection_products")
        .insert(payload)
        .select("id")
        .single();
      if (error || !data) {
        setSaving(false);
        return toast.error(error?.message ?? "השמירה נכשלה");
      }
      productId = data.id;
    }

    const plan = planVariantSync(savedVariants, variants, productId);
    const results = await Promise.all([
      plan.inserts.length
        ? supabase.from("product_variants").insert(plan.inserts)
        : Promise.resolve({ error: null }),
      ...plan.updates.map((u) =>
        supabase
          .from("product_variants")
          .update({
            name: u.name,
            swatch: u.swatch,
            image_url: u.image_url,
            sort_order: u.sort_order,
          })
          .eq("id", u.id),
      ),
      plan.deletes.length
        ? supabase.from("product_variants").delete().in("id", plan.deletes)
        : Promise.resolve({ error: null }),
    ]);
    setSaving(false);

    if (results.find((r) => r.error)) {
      return toast.error("המוצר נשמר, אבל חלק מהצבעים לא. נסו לשמור שוב.");
    }
    toast.success("נשמר");
    nav("/admin/collections");
  };

  const remove = async () => {
    if (!product?.id) return;
    if (!confirm(`למחוק את "${product.name}"? אי אפשר לבטל.`)) return;
    const { error } = await supabase
      .from("site_collection_products")
      .delete()
      .eq("id", product.id);
    if (error) return toast.error(error.message);
    toast.success("נמחק");
    nav("/admin/collections");
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">טוען…</p>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">המוצר הזה לא נמצא.</p>
        <Link to="/admin/collections" className="mt-4 inline-block underline underline-offset-4">
          חזרה לקולקציות
        </Link>
      </AdminLayout>
    );
  }

  const gallery = (product.gallery as string[]) ?? [];

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <Link
          to="/admin/collections"
          className="mb-6 inline-flex h-10 items-center gap-2 rounded-sm -ms-3 px-3 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          חזרה לקולקציות
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl text-foreground">
            {isNew ? "מוצר חדש" : product.name}
          </h1>
          <Button onClick={save} disabled={saving || uploading} size="lg">
            {saving && <Loader2 className="ms-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            שמירה
          </Button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* ── What the product is ─────────────────────────────────── */}
          <div className="space-y-8 lg:col-span-2">
            <section className="rounded-sm border border-border bg-card p-6">
              <div className="space-y-5">
                <div>
                  <Label htmlFor="p-name">שם המוצר</Label>
                  <Input
                    id="p-name"
                    dir={contentDirection(product.name ?? "")}
                    value={product.name ?? ""}
                    onChange={(e) => patch({ name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="p-tagline">משפט פתיחה</Label>
                  <Input
                    id="p-tagline"
                    dir={contentDirection(product.tagline ?? "")}
                    value={product.tagline ?? ""}
                    onChange={(e) => patch({ tagline: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="p-about">על המוצר</Label>
                  <BufferedTextarea
                    id="p-about"
                    rows={5}
                    initial={((product.description as string[]) ?? []).join("\n\n")}
                    placeholder={"פסקה ראשונה…\n\nפסקה שנייה…"}
                    onCommit={(raw) =>
                      patch({
                        description: raw
                          .split(/\n\s*\n/)
                          .map((x) => x.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              </div>
            </section>

            <section className="rounded-sm border border-border bg-card p-6">
              <div>
                <PhotoSpec spec="product" />
              </div>

              <div className="flex flex-wrap items-start gap-4">
                <div className="w-32">
                  <div className="aspect-square overflow-hidden rounded-sm border border-border bg-secondary">
                    {product.cover_url ? (
                      <img
                        src={product.cover_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-sm text-muted-foreground">
                        אין תמונה
                      </div>
                    )}
                  </div>
                  <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-border px-3 py-2 text-sm hover:bg-secondary">
                    <Upload className="h-4 w-4" />
                    {product.cover_url ? "החלפה" : "תמונה ראשית"}
                    <input
                      type="file"
                      accept={ACCEPT_ATTRIBUTE}
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
                    />
                  </label>
                </div>

                <div className="min-w-[12rem] flex-1">
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {gallery.map((g, i) => (
                      <li key={g} className="relative">
                        <img
                          src={g}
                          alt=""
                          className="h-16 w-16 rounded-sm border border-border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            patch({ gallery: gallery.filter((_, n) => n !== i) })
                          }
                          aria-label="הסרת התמונה"
                          className="absolute -top-2 -end-2 grid h-6 w-6 place-items-center rounded-full bg-foreground text-background"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                    <li>
                      <label className="grid h-16 w-16 cursor-pointer place-items-center rounded-sm border border-dashed border-border text-muted-foreground hover:bg-secondary">
                        <Upload className="h-4 w-4" />
                        <input
                          type="file"
                          accept={ACCEPT_ATTRIBUTE}
                          multiple
                          className="hidden"
                          onChange={(e) => e.target.files && uploadGallery(e.target.files)}
                        />
                      </label>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="rounded-sm border border-border bg-card p-6">
              <ProductFinishes value={variants} onChange={setVariants} />
            </section>

            <section className="rounded-sm border border-border bg-card p-6">
              <div className="space-y-5">
                <div>
                  <Label htmlFor="p-materials">חומרים</Label>
                  <BufferedTextarea
                    id="p-materials"
                    rows={3}
                    initial={((product.materials as string[]) ?? []).join("\n")}
                    placeholder={"אלומיניום\nבד Sunbrella"}
                    onCommit={(raw) =>
                      patch({
                        materials: raw
                          .split("\n")
                          .map((x) => x.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="p-dims">מידות</Label>
                  <BufferedInput
                    id="p-dims"
                    initial={product.dimensions ?? ""}
                    placeholder="אורך 240 ס״מ · עומק 92 ס״מ"
                    onCommit={(v) => patch({ dimensions: v })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="p-price">מחיר</Label>
                    <Input
                      id="p-price"
                      inputMode="decimal"
                      dir="ltr"
                      defaultValue={product.price ?? ""}
                      onChange={(e) => patch({ price: parsePriceInput(e.target.value) })}
                      placeholder="12400"
                    />
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatPrice(product.price ?? null) ? (
                        <>
                          יופיע באתר: <Ltr>{formatPrice(product.price ?? null)}</Ltr>
                        </>
                      ) : (
                        "ריק = לא יופיע מחיר."
                      )}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="p-price-note">הערה ליד המחיר</Label>
                    <Input
                      id="p-price-note"
                      value={product.price_note ?? ""}
                      onChange={(e) => patch({ price_note: e.target.value })}
                      placeholder="החל מ־"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ── What is true about it ───────────────────────────────── */}
          <aside className="space-y-6">
            <section className="rounded-sm border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <Switch
                  id="p-published"
                  checked={product.published ?? true}
                  onCheckedChange={(v) => patch({ published: v })}
                />
                <Label htmlFor="p-published" className="!mt-0">
                  {product.published ?? true ? "מופיע באתר" : "מוסתר"}
                </Label>
              </div>
            </section>

            <section className="rounded-sm border border-border bg-card p-6">
              <select
                value={product.collection_id ?? ""}
                onChange={(e) => patch({ collection_id: e.target.value })}
                aria-label="הקולקציה של המוצר"
                className="mt-4 h-11 w-full rounded-sm border border-input bg-background px-3 text-base text-foreground"
              >
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_he}
                  </option>
                ))}
              </select>
            </section>

            {!isNew && (
              <section className="rounded-sm border border-destructive/30 bg-card p-6">
                <Button variant="outline" onClick={remove} className="w-full">
                  <Trash2 className="ms-2 h-4 w-4" />
                  מחיקת המוצר
                </Button>
              </section>
            )}
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductEdit;
