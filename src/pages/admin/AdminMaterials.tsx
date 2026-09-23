import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/admin-storage";
import { useCrop } from "@/components/admin/CropProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PhotoSpec from "@/components/admin/PhotoSpec";
import { ACCEPT_ATTRIBUTE } from "@/lib/photo-specs";
import { slugify } from "./catalogue-shared";
import { PHOTOS } from "@/data/materials";
import MigrationNotice from "@/components/admin/MigrationNotice";
import { isMissingSchema } from "@/lib/missing-migration";
import AdminLayout from "./AdminLayout";

type Material = {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  tagline: string | null;
  body: string | null;
  image_url: string | null;
  published: boolean;
  sort_order: number;
};

/**
 * The materials, as content.
 *
 * They were four entries in a source file, which meant the owner could not add
 * a fifth, correct a word, or replace a photograph. Everything here appears on
 * /materials in one fixed composition, in the home page's strip, and in the
 * list of materials on every product made of it.
 *
 * The slug is generated once, from the name, and then left alone: it is the
 * anchor a product page links to. Renaming a material must not break links
 * that are already out there, so the name and the slug part ways after the
 * first save — the same rule the product screen follows.
 */
const AdminMaterials = () => {
  const requestCrop = useCrop();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  /** The table is not there yet: the screen says so instead of failing. */
  const [needsScript, setNeedsScript] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("site_materials")
      .select("*")
      .order("sort_order", { ascending: true });
    if (isMissingSchema(error)) setNeedsScript(true);
    else if (error) toast.error("לא הצלחנו לטעון את החומרים");
    setMaterials((data as Material[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const patch = (id: string, changes: Partial<Material>) =>
    setMaterials((list) => list.map((m) => (m.id === id ? { ...m, ...changes } : m)));

  const save = async (m: Material) => {
    if (!m.name.trim()) return toast.error("צריך שם לחומר");
    setBusy(true);
    const { error } = await supabase
      .from("site_materials")
      .update({
        name: m.name,
        name_en: m.name_en?.trim() || null,
        tagline: m.tagline?.trim() || null,
        body: m.body?.trim() || null,
        image_url: m.image_url,
        published: m.published,
        sort_order: m.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", m.id);
    setBusy(false);
    if (error) return toast.error("השמירה נכשלה");
    toast.success("נשמר");
  };

  const add = async () => {
    setBusy(true);
    const name = "חומר חדש";
    const { error } = await supabase.from("site_materials").insert({
      // Unique from the start: two materials added before either is named
      // would otherwise collide on the same slug.
      slug: `${slugify(name)}-${Date.now().toString(36).slice(-4)}`,
      name,
      published: false,
      sort_order: (materials.at(-1)?.sort_order ?? 0) + 10,
    });
    setBusy(false);
    if (isMissingSchema(error)) return setNeedsScript(true);
    if (error) return toast.error("לא הצלחנו להוסיף חומר");
    load();
  };

  const remove = async (m: Material) => {
    if (!confirm(`למחוק את ${m.name}? הוא ייעלם גם מהמוצרים שמסומנים בו.`)) return;
    const { error } = await supabase.from("site_materials").delete().eq("id", m.id);
    if (error) return toast.error("המחיקה נכשלה");
    setMaterials((list) => list.filter((x) => x.id !== m.id));
    toast.success("נמחק");
  };

  const upload = async (m: Material, file: File) => {
    const cropped = await requestCrop(file, "material");
    if (!cropped) return;
    setUploading(m.id);
    try {
      const { url } = await uploadFile("site-collections", cropped);
      patch(m.id, { image_url: url });
    } catch {
      toast.error("העלאת התמונה נכשלה");
    } finally {
      setUploading(null);
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <p className="text-muted-foreground">טוען…</p>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-foreground">חומרים</h1>
          </div>
          <Button onClick={add} disabled={busy} className="shrink-0">
            <Plus className="w-4 h-4 ms-1" /> חומר חדש
          </Button>
        </div>

        <div className="mt-8">
          <PhotoSpec spec="material" />
        </div>

        {needsScript && (
          <div className="mb-8">
            <MigrationNotice what="מסך החומרים" />
          </div>
        )}

        {!needsScript && materials.length === 0 && (
          <p className="rounded-sm border border-dashed border-border p-8 text-center text-base text-muted-foreground">
            אין עדיין חומרים. עד שיהיו, האתר מציג את ארבעת החומרים שאיתם הוא נבנה.
          </p>
        )}

        <div className="space-y-10">
          {materials.map((m) => (
            <section key={m.id} className="border-b border-border pb-8">
              <div className="flex flex-wrap gap-5">
                <div className="w-full sm:w-52">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-border bg-secondary">
                    {/* The four the site was built with have no image_url —
                        the site draws them from the bundle — so the screen
                        shows the same photograph rather than an empty frame
                        with a paragraph explaining the empty frame. */}
                    {(m.image_url || PHOTOS[m.slug]?.image) && (
                      <img
                        src={m.image_url || PHOTOS[m.slug]?.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                    {uploading === m.id && (
                      <div className="absolute inset-0 grid place-items-center bg-background/70">
                        <Loader2 className="h-5 w-5 animate-spin text-foreground" />
                      </div>
                    )}
                  </div>
                  <label className="mt-2 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-sm border border-border text-base text-foreground hover:bg-secondary">
                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                    {m.image_url ? "החלפה" : "תמונה"}
                    <input
                      type="file"
                      accept={ACCEPT_ATTRIBUTE}
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && upload(m, e.target.files[0])}
                    />
                  </label>
                </div>

                <div className="min-w-[260px] flex-1 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`m-name-${m.id}`}>שם</Label>
                      <Input
                        id={`m-name-${m.id}`}
                        value={m.name}
                        onChange={(e) => patch(m.id, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`m-name-en-${m.id}`}>השם באנגלית</Label>
                      <Input
                        id={`m-name-en-${m.id}`}
                        dir="ltr"
                        value={m.name_en ?? ""}
                        onChange={(e) => patch(m.id, { name_en: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`m-tagline-${m.id}`}>שורה אחת מתחת לשם</Label>
                    <Input
                      id={`m-tagline-${m.id}`}
                      value={m.tagline ?? ""}
                      placeholder="נוחות שלא נכנעת לשמש"
                      onChange={(e) => patch(m.id, { tagline: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`m-body-${m.id}`}>הסבר</Label>
                    <Textarea
                      id={`m-body-${m.id}`}
                      rows={6}
                      value={m.body ?? ""}
                      placeholder={"פסקה ראשונה.\n\nשורה ריקה מתחילה פסקה חדשה."}
                      onChange={(e) => patch(m.id, { body: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`m-order-${m.id}`} className="font-normal">
                        סדר
                      </Label>
                      <Input
                        id={`m-order-${m.id}`}
                        type="number"
                        value={m.sort_order}
                        onChange={(e) => patch(m.id, { sort_order: Number(e.target.value) })}
                        className="w-20"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-base text-foreground">
                      <input
                        type="checkbox"
                        checked={m.published}
                        onChange={(e) => patch(m.id, { published: e.target.checked })}
                      />
                      מפורסם
                    </label>
                    <Button size="sm" onClick={() => save(m)} disabled={busy || uploading === m.id}>
                      שמירה
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => remove(m)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">מחיקה</span>
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMaterials;
