import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/admin-storage";
import PhotoTiles from "@/components/admin/PhotoTiles";
import { contentDirection } from "@/lib/field-direction";
import { slugify } from "./catalogue-shared";

type Project = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  location: string | null;
  category: string | null;
  cover_url: string | null;
  gallery: any;
  meta_description: string | null;
  sort_order: number;
  views: number;
  published: boolean;
};

const empty: Partial<Project> = {
  slug: "",
  title: "",
  description: "",
  location: "",
  category: "",
  cover_url: "",
  gallery: [],
  meta_description: "",
  sort_order: 0,
  published: true,
};

const AdminProjects = () => {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_projects")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Project[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title) {
      toast.error("חובה להזין כותרת");
      return;
    }
    const finalSlug = editing.id ? editing.slug : slugify(editing.title);
    setSaving(true);
    const payload = {
      slug: finalSlug,
      title: editing.title,
      description: editing.description || null,
      location: editing.location || null,
      category: editing.category || null,
      cover_url: editing.cover_url || null,
      gallery: editing.gallery || [],
      meta_description: editing.meta_description || null,
      sort_order: editing.sort_order ?? 0,
      published: editing.published ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("site_projects").update(payload).eq("id", editing.id)
      : await supabase.from("site_projects").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("נשמר בהצלחה");
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("למחוק פרויקט זה?")) return;
    const { error } = await supabase.from("site_projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("נמחק");
    load();
  };

  return (
    <AdminLayout>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-foreground">פרויקטים</h1>
        </div>
        <Button onClick={() => setEditing({ ...empty })}>
          <Plus className="w-4 h-4 ml-2" />
          פרויקט חדש
        </Button>
      </header>


      {loading ? (
        <p className="text-muted-foreground">טוען…</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <p>עדיין אין פרויקטים משלכם.</p>
            <p className="mx-auto mt-3 max-w-md text-base">
              באתר מוצגים כרגע שישה פרויקטים לדוגמה, עם תמונות מיוצרות. ברגע
              שתפרסמו פרויקט אמיתי אחד — כל השישה ייעלמו והאתר יציג רק אותו.
              כדאי להוסיף שניים־שלושה באותה ישיבה.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center gap-4 p-4">

                {p.cover_url ? (
                  <img src={p.cover_url} alt={p.title} className="w-20 h-20 object-cover rounded" />
                ) : (
                  <div className="w-20 h-20 bg-muted rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{p.title}</h3>
                    {!p.published && (
                      <span className="text-base bg-muted px-2 py-0.5 rounded">טיוטה</span>
                    )}
                  </div>
                  <p className="text-base text-muted-foreground truncate">
                    /{p.slug} • {p.location || "—"} • {p.views} צפיות
                  </p>
                </div>
                {/* Icon-only buttons need a name: a screen reader announced
                    both of these as just "button". */}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`עריכת ${p.title}`}
                  onClick={() => setEditing(p)}
                >
                  <Pencil className="w-4 h-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`מחיקת ${p.title}`}
                  onClick={() => handleDelete(p.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => {
          if (o) return;
          // Photos are uploaded to storage the moment they are chosen, and
          // live only in this dialog's state until save. Closing used to
          // discard them silently — the files stay in the bucket with nothing
          // pointing at them, and the owner has no idea the work is gone.
          const hasUploads = Boolean(editing?.cover_url) || (editing?.gallery?.length ?? 0) > 0;
          if (hasUploads && !confirm("לסגור בלי לשמור? התמונות שהעליתם יאבדו.")) return;
          setEditing(null);
        }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "עריכת פרויקט" : "פרויקט חדש"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>כותרת *</Label>
                <Input
                  dir={contentDirection(editing.title || "")}
                value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
                {editing.id && (
                  <p className="text-base text-muted-foreground mt-1" dir="ltr">
                    slug: {editing.slug}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>מיקום</Label>
                  <Input
                    dir={contentDirection(editing.location || "")}
                value={editing.location || ""}
                    onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label>קטגוריה / תגית</Label>
                  <Input
                    value={editing.category || ""}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>תיאור</Label>
                <Textarea
                  rows={4}
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              {/* One strip, cover first, exactly as the product screen. */}
              <div>
                <Label>תמונות</Label>
                <div className="mt-2">
                  <PhotoTiles
                    spec="project"
                    bucket="site-projects"
                    firstLabel="כיסוי"
                    photos={[editing.cover_url, ...((editing.gallery as string[]) || [])].filter(
                      Boolean,
                    ) as string[]}
                    onChange={(next) =>
                      setEditing((e) =>
                        e ? { ...e, cover_url: next[0] ?? "", gallery: next.slice(1) } : e,
                      )
                    }
                  />
                </div>
              </div>
              <div>
                <Label>תיאור לגוגל</Label>
                <Textarea
                  rows={2}
                  maxLength={160}
                  value={editing.meta_description || ""}
                  onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>סדר תצוגה</Label>
                  <Input
                    type="number"
                    value={editing.sort_order ?? 0}
                    onChange={(e) =>
                      setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Switch
                    checked={editing.published ?? true}
                    onCheckedChange={(v) => setEditing({ ...editing, published: v })}
                  />
                  <Label className="!mt-0">פורסם</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              ביטול
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving ? "שומר…" : "שמירה"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProjects;
