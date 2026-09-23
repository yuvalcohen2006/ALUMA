import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import PhotoTiles from "@/components/admin/PhotoTiles";

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

  if (loading) return <AdminLayout>טוען…</AdminLayout>;

  return (
    <AdminLayout>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-foreground">התמונה הראשית</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>מחשב</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoTiles
              spec="hero"
              bucket="site-hero"
              single
              photos={hero.desktop_image ? [hero.desktop_image] : []}
              onChange={(next) => setHero((h) => ({ ...h, desktop_image: next[0] ?? "" }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>טלפון</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoTiles
              spec="hero"
              bucket="site-hero"
              single
              photos={hero.mobile_image ? [hero.mobile_image] : []}
              onChange={(next) => setHero((h) => ({ ...h, mobile_image: next[0] ?? "" }))}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>טקסטים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Both fields used to look identical and behave nothing alike:
              the headline is the page's hidden h1 and never appears on screen,
              and the tagline was saved and then read by nothing at all. The
              tagline now renders under the logo; the headline says plainly
              that it is for Google and screen readers. */}
          <div>
            <Label>כותרת לגוגל</Label>
            <Input
              value={hero.title_he || ""}
              onChange={(e) => setHero({ ...hero, title_he: e.target.value })}
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
                placeholder="/faq#contact"
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
