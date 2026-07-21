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
import { Plus, Pencil, Trash2, Upload, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/admin-storage";

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

const slugify = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^\u0590-\u05FF\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");

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

  const handleCoverUpload = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadFile("site-projects", file);
      setEditing((e) => ({ ...e!, cover_url: url }));
      toast.success("התמונה הועלתה");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        const { url } = await uploadFile("site-projects", f);
        urls.push(url);
      }
      setEditing((e) => ({ ...e!, gallery: [...(e?.gallery || []), ...urls] }));
      toast.success(`${urls.length} תמונות נוספו`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-primary">פרויקטים</h1>
          <p className="text-muted-foreground mt-1">ניהול הפרויקטים שמוצגים באתר</p>
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
            עדיין אין פרויקטים. הוסיפו פרויקט ראשון.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                {p.cover_url ? (
                  <img src={p.cover_url} alt={p.title} className="w-20 h-20 object-cover rounded" />
                ) : (
                  <div className="w-20 h-20 bg-muted rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{p.title}</h3>
                    {!p.published && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">טיוטה</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    /{p.slug} • {p.location || "—"} • {p.views} צפיות
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditing(p)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "עריכת פרויקט" : "פרויקט חדש"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>כותרת *</Label>
                <Input
                  value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
                {editing.id && (
                  <p className="text-xs text-muted-foreground mt-1" dir="ltr">
                    slug: {editing.slug}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>מיקום</Label>
                  <Input
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
              <div>
                <Label>תמונת כיסוי</Label>
                <div className="flex items-center gap-3 mt-2">
                  {editing.cover_url && (
                    <img src={editing.cover_url} alt="cover" className="w-24 h-24 object-cover rounded" />
                  )}
                  <label className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded cursor-pointer hover:bg-muted text-sm">
                    <Upload className="w-4 h-4" />
                    {editing.cover_url ? "החלפה" : "העלאה"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
              <div>
                <Label>גלריית תמונות</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {(editing.gallery as string[] || []).map((url, i) => (
                    <div key={i} className="relative aspect-square">
                      <img src={url} alt="" className="w-full h-full object-cover rounded" />
                      <button
                        onClick={() =>
                          setEditing({
                            ...editing,
                            gallery: (editing.gallery as string[]).filter((_, idx) => idx !== i),
                          })
                        }
                        className="absolute top-1 left-1 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:bg-muted">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
                    />
                  </label>
                </div>
              </div>
              <div>
                <Label>תיאור SEO (meta description)</Label>
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
