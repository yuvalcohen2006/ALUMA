import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionLabel from "@/components/SectionLabel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LogOut, Calendar, MapPin, ClipboardList, UserRound } from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  status: string;
  progress: number;
  next_milestone: string | null;
  next_milestone_date: string | null;
  updated_at: string;
};

type Profile = { full_name: string | null; phone: string | null };

const statusLabels: Record<string, string> = {
  lead: "פנייה ראשונית",
  design: "תכנון ועיצוב",
  production: "ייצור",
  installation: "התקנה",
  completed: "הושלם",
  on_hold: "בהמתנה",
};

const Account = () => {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile>({ full_name: "", phone: "" });
  const [busy, setBusy] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav("/club/auth", { replace: true });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p, error: pErr }, { data: pr, error: prErr }] = await Promise.all([
        supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
        supabase
          .from("customer_projects")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
      ]);
      // Surface a real failure instead of silently rendering an empty dashboard.
      if (pErr || prErr) {
        toast.error("שגיאה בטעינת הנתונים. רעננו את הדף או נסו שוב מאוחר יותר.");
      }
      setProfile({ full_name: p?.full_name ?? "", phone: p?.phone ?? "" });
      setProjects((pr as Project[]) ?? []);
      setBusy(false);
    })();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("התנתקת בהצלחה");
    nav("/");
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: profile.full_name, phone: profile.phone })
      .eq("id", user.id);
    setSavingProfile(false);
    if (error) return toast.error(error.message);
    toast.success("הפרטים עודכנו");
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">טוען…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="האזור האישי שלי | מועדון אלומה" description="מעקב הזמנה ופרטי חשבון." path="/club/dashboard" />

      <section className="pt-32 pb-6 md:pt-40 gradient-cream">
        <div className="container-luxury">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <SectionLabel he="מועדון אלומה" en="My Club" className="text-xs mb-4" />
              <h1 className="font-display text-3xl md:text-5xl text-foreground">
                שלום {profile.full_name || "חבר יקר"}
              </h1>
              <p className="text-muted-foreground mt-2">{user.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              התנתקות
            </Button>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-luxury">
          <Tabs defaultValue="orders" dir="rtl">
            <TabsList className="mb-8">
              <TabsTrigger value="orders" className="gap-2">
                <ClipboardList className="w-4 h-4" />
                ההזמנות שלי {projects.length > 0 && `(${projects.length})`}
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2">
                <UserRound className="w-4 h-4" />
                הפרטים שלי
              </TabsTrigger>
            </TabsList>

            {/* Orders */}
            <TabsContent value="orders">
              {busy ? (
                <p className="text-muted-foreground">טוען…</p>
              ) : projects.length === 0 ? (
                <div className="bg-card border border-border rounded-sm p-10 text-center">
                  <p className="text-muted-foreground mb-4">אין לך עדיין הזמנה פעילה.</p>
                  <Button asChild>
                    <Link to="/faq#contact">צור קשר להתחלת פרויקט</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-5">
                  {projects.map((p) => (
                    <article key={p.id} className="bg-card border border-border rounded-sm p-6  transition-smooth">
                      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                        <div>
                          <h3 className="font-display text-2xl text-primary">{p.title}</h3>
                          {p.location && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {p.location}
                            </p>
                          )}
                        </div>
                        <span className="text-xs tracking-wider uppercase px-3 py-1 rounded-sm bg-accent/10 text-accent">
                          {statusLabels[p.status] || p.status}
                        </span>
                      </div>
                      {p.description && <p className="text-sm text-muted-foreground mb-4">{p.description}</p>}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>התקדמות</span>
                          <span>{p.progress}%</span>
                        </div>
                        <Progress value={p.progress} />
                      </div>
                      {p.next_milestone && (
                        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-accent" />
                          <span className="text-muted-foreground">אבן דרך הבאה:</span>
                          <span className="text-foreground font-medium">{p.next_milestone}</span>
                          {p.next_milestone_date && (
                            <span className="text-xs text-muted-foreground mr-auto">
                              {new Date(p.next_milestone_date).toLocaleDateString("he-IL")}
                            </span>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Profile */}
            <TabsContent value="profile">
              <form onSubmit={saveProfile} className="max-w-md space-y-5 bg-card border border-border rounded-sm p-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">שם מלא</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name ?? ""}
                    onChange={(e) => setProfile((s) => ({ ...s, full_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">טלפון</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone ?? ""}
                    onChange={(e) => setProfile((s) => ({ ...s, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>אימייל</Label>
                  <Input value={user.email ?? ""} disabled dir="ltr" />
                  <p className="text-xs text-muted-foreground">לשינוי אימייל צור קשר</p>
                </div>
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? "שומר..." : "שמור שינויים"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Account;
