import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/admin-storage";

type Hero = {
  title_he?: string;
  subtitle?: string;
  desktop_image?: string;
  mobile_image?: string;
  cta_text?: string;
  cta_link?: string;
};

const AdminHero = () => {
  const [hero, setHero] = useState<Hero>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero")
        .maybeSingle();
      setHero((data?.value as Hero) || {});
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "hero", value: hero as any });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("הירו נשמר");
  };

  const handleUpload = async (which: "desktop_image" | "mobile_image", file: File) => {
    try {
      const { url } = await uploadFile("site-hero", file);
      setHero((h) => ({ ...h, [which]: url }));
      toast.success("הועלה — לחצו שמירה לעדכון בדף הבית");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) return <AdminLayout>טוען…</AdminLayout>;

  return (
    <AdminLayout>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-primary">הירו ראשי</h1>
        <p className="text-muted-foreground mt-1">
          תמונה ותוכן הבאנר הראשי בדף הבית. אפשר להגדיר תמונה נפרדת לדסקטופ ולמובייל.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>תמונת רקע — דסקטופ</CardTitle>
          </CardHeader>
          <CardContent>
            {hero.desktop_image ? (
              <img
                src={hero.desktop_image}
                alt="desktop hero"
                className="w-full aspect-video object-cover rounded mb-3"
              />
            ) : (
              <div className="w-full aspect-video bg-muted rounded mb-3 flex items-center justify-center text-muted-foreground text-sm">
                לא הוגדרה תמונה (יוצג ה-default של האתר)
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded cursor-pointer hover:bg-muted text-sm">
              <Upload className="w-4 h-4" />
              העלאת תמונה
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleUpload("desktop_image", e.target.files[0])}
              />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>תמונת רקע — מובייל</CardTitle>
          </CardHeader>
          <CardContent>
            {hero.mobile_image ? (
              <img
                src={hero.mobile_image}
                alt="mobile hero"
                className="w-48 aspect-[9/16] object-cover rounded mb-3 mx-auto"
              />
            ) : (
              <div className="w-48 aspect-[9/16] bg-muted rounded mb-3 mx-auto flex items-center justify-center text-muted-foreground text-xs text-center px-4">
                לא הוגדרה תמונה למובייל (יוצג זה של הדסקטופ)
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded cursor-pointer hover:bg-muted text-sm">
              <Upload className="w-4 h-4" />
              העלאת תמונה
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleUpload("mobile_image", e.target.files[0])}
              />
            </label>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>טקסטים וכפתור</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>כותרת ראשית</Label>
            <Input
              value={hero.title_he || ""}
              onChange={(e) => setHero({ ...hero, title_he: e.target.value })}
            />
          </div>
          <div>
            <Label>תת-כותרת (Tagline)</Label>
            <Input
              value={hero.subtitle || ""}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>טקסט כפתור CTA</Label>
              <Input
                value={hero.cta_text || ""}
                onChange={(e) => setHero({ ...hero, cta_text: e.target.value })}
                placeholder="לדוגמה: לקבלת הצעת מחיר"
              />
            </div>
            <div>
              <Label>קישור הכפתור</Label>
              <Input
                value={hero.cta_link || ""}
                onChange={(e) => setHero({ ...hero, cta_link: e.target.value })}
                dir="ltr"
                placeholder="/contact"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button onClick={save} disabled={saving} size="lg">
          {saving ? "שומר…" : "שמירת שינויים"}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminHero;
