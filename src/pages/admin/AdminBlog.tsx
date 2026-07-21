import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/admin-storage";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  tag: string | null;
  read_minutes: number | null;
  published: boolean;
  published_at: string | null;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u0590-\u05FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const empty: Partial<Post> = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  tag: "",
  read_minutes: 5,
  published: false,
};

const AdminBlog = () => {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Post> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Post[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title) return toast.error("חובה כותרת");
    const finalSlug = (editing.slug && editing.slug.trim()) || slugify(editing.title);
    if (!finalSlug) return toast.error("לא ניתן ליצור slug מהכותרת");
    setSaving(true);
    const payload = {
      slug: finalSlug,
      title: editing.title,
      excerpt: editing.excerpt || null,
      content: editing.content || null,
      cover_image_url: editing.cover_image_url || null,
      tag: editing.tag || null,
      read_minutes: editing.read_minutes || 5,
      published: editing.published ?? false,
      published_at: editing.published ? (editing.published_at || new Date().toISOString()) : null,
    };
    const { error } = editing.id
      ? await supabase.from("blog_posts").update(payload).eq("id", editing.id)
      : await supabase.from("blog_posts").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("נשמר");
    setEditing(null);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("למחוק פוסט?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("נמחק");
    load();
  };

  const uploadCover = async (file: File) => {
    try {
      const { url } = await uploadFile("blog-images", file);
      setEditing((e) => ({ ...e!, cover_image_url: url }));
      toast.success("התמונה הועלתה");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AdminLayout>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-primary">מגזין</h1>
          <p className="text-muted-foreground mt-1">ניהול פוסטים בבלוג</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })}>
          <Plus className="w-4 h-4 ml-2" />
          פוסט חדש
        </Button>
      </header>

      {loading ? (
        <p>טוען…</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            אין פוסטים. צרו פוסט ראשון.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center gap-4 p-4">
                {p.cover_image_url ? (
                  <img src={p.cover_image_url} alt="" className="w-20 h-20 object-cover rounded" />
                ) : (
                  <div className="w-20 h-20 bg-muted rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{p.title}</h3>
                    {!p.published && <span className="text-xs bg-muted px-2 py-0.5 rounded">טיוטה</span>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">/{p.slug} • {p.tag || "—"}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditing(p)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => del(p.id)}>
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
            <DialogTitle>{editing?.id ? "עריכת פוסט" : "פוסט חדש"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>כותרת *</Label>
                <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <Label>תקציר</Label>
                <Textarea rows={2} value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
              </div>
              <div>
                <Label>תוכן (Markdown / HTML)</Label>
                <Textarea rows={12} value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
              </div>
              <div>
                <Label>תמונת כיסוי</Label>
                <div className="flex items-center gap-3 mt-2">
                  {editing.cover_image_url && (
                    <img src={editing.cover_image_url} alt="" className="w-24 h-24 object-cover rounded" />
                  )}
                  <label className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded cursor-pointer hover:bg-muted text-sm">
                    <Upload className="w-4 h-4" />
                    העלאה
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>תגית</Label>
                  <Input value={editing.tag || ""} onChange={(e) => setEditing({ ...editing, tag: e.target.value })} />
                </div>
                <div className="flex items-end gap-2">
                  <Switch checked={editing.published ?? false} onCheckedChange={(v) => setEditing({ ...editing, published: v })} />
                  <Label className="!mt-0">פורסם</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>ביטול</Button>
            <Button onClick={save} disabled={saving}>{saving ? "שומר…" : "שמירה"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBlog;
