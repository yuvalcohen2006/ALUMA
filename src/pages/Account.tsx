import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ProductCell from "@/components/ProductCell";
import ShineButton from "@/components/ui/shine-button";
import ShineAction from "@/components/ui/shine-action";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import type { DBProduct } from "@/hooks/useCollectionsData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

type FavProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  cover_url: string | null;
};

const statusLabels: Record<string, string> = {
  lead: "פנייה ראשונית",
  design: "תכנון ועיצוב",
  production: "ייצור",
  installation: "התקנה",
  completed: "הושלם",
  on_hold: "בהמתנה",
};

/** Folio number, printed-portfolio style: 1 → "01" — same device as /projects. */
const folio = (n: number) => String(n).padStart(2, "0");

// The site's own field grammar, the one the contact form and the questionnaire
// use: 14px-tall control, 10px radius, 18px ink, and no outline-none — the
// global focus-visible ring is what keyboard users navigate by. Written out
// here rather than reached for through the shadcn <Input>/<Label>, whose base
// classes are text-base/md:text-sm and text-sm: an 18px override only beats
// them on stylesheet order, which is not a thing to rest a type floor on.
const fieldClass =
  "h-14 w-full rounded-[10px] border border-border bg-background px-5 text-meta text-foreground text-right placeholder:text-muted-foreground/70 transition-smooth focus:border-primary focus:ring-4 focus:ring-primary/15";
const labelClass = "mb-2.5 block font-display text-meta font-medium text-foreground";

/**
 * ProductCell renders a full catalogue product; the favorites query fetches
 * only the fields the card actually shows. The rest is padded so the type
 * stays honest without widening the query — tag/dimensions arrive null, so
 * the cell simply renders without its meta line.
 */
const toCellProduct = (p: FavProduct): DBProduct => ({
  id: p.id,
  collection_id: "",
  slug: p.slug,
  name: p.name,
  tag: null,
  tagline: p.tagline,
  description: [],
  highlights: [],
  materials: [],
  dimensions: null,
  cover_url: p.cover_url,
  gallery: [],
});

const Account = () => {
  const { user, loading, signOut } = useAuth();
  const { ids: favIds, loading: favLoading } = useFavorites();
  const nav = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile>({ full_name: "", phone: "" });
  const [favProducts, setFavProducts] = useState<FavProduct[]>([]);
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

  // Load favorite product details when favIds change
  useEffect(() => {
    if (!user) return;
    if (favIds.size === 0) {
      setFavProducts([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("site_collection_products")
        .select("id, slug, name, tagline, cover_url")
        .in("id", Array.from(favIds));
      setFavProducts((data as FavProduct[]) ?? []);
    })();
  }, [favIds, user]);

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
      <SEO
        title="האזור האישי שלי | מועדון אלומה"
        description="מעקב הזמנה, מועדפים ופרטי חשבון."
        path="/club/dashboard"
        noIndex
      />

      <PageHero
        title="האזור האישי"
        subtitle={`שלום ${profile.full_name || "חבר יקר"}, כאן עוקבים אחרי הפרויקט שלכם, חוזרים למוצרים ששמרתם ומעדכנים את הפרטים.`}
        filterSlot={
          // The quiet counterpart to the page's real actions: sign-out sits in
          // the filter position under the title, as plain ink. -scale-x-100 on
          // the icon so the "exit" arrow points forward — left, in RTL.
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-meta text-muted-foreground hover:text-accent transition-smooth"
          >
            התנתקות
            <LogOut className="w-[18px] h-[18px] -scale-x-100" aria-hidden="true" />
          </button>
        }
      />

      <section className="bg-background pt-10 md:pt-14 pb-24 md:pb-32">
        <div className="container-luxury">
          {/* ————— THE PROJECTS LEDGER ————— */}
          <Reveal>
            <SectionHeading align="start" as="h2">
              הפרויקטים שלי
            </SectionHeading>
          </Reveal>

          {busy ? (
            <p className="mt-8 text-lede text-foreground-soft">טוען…</p>
          ) : projects.length === 0 ? (
            <Reveal className="mt-8 md:mt-10">
              <p className="max-w-2xl text-lede text-foreground-soft text-pretty">
                עדיין אין פרויקט פעיל בחשבון שלכם. מהרגע שנתחיל לתכנן יחד, כל שלב יופיע כאן — מהשרטוט
                הראשון ועד ההתקנה בחצר.
              </p>
              <div className="mt-7">
                <ShineButton to="/collections">
                  לצפייה בקולקציות
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                </ShineButton>
              </div>
            </Reveal>
          ) : (
            /* Each project is an entry in the same ledger grammar as /projects:
               folio numeral with a rule running off it, the name at card size,
               a meta line threaded on thin terracotta rules. */
            <div className="mt-2 md:mt-4 divide-y divide-border">
              {projects.map((p, i) => {
                const meta = [
                  statusLabels[p.status] || p.status,
                  p.location,
                  `עודכן ${new Date(p.updated_at).toLocaleDateString("he-IL")}`,
                ].filter(Boolean) as string[];

                return (
                  <Reveal key={p.id} className="py-10 md:py-12">
                    <article>
                      <div className="flex items-center gap-4">
                        <span
                          aria-hidden="true"
                          className="font-display text-[40px] md:text-[48px] leading-none tabular-nums text-primary/70"
                        >
                          {folio(i + 1)}
                        </span>
                        <span aria-hidden="true" className="h-px flex-1 bg-primary/25" />
                      </div>

                      <h3 className="mt-5 font-display font-normal text-card-title text-foreground">
                        {p.title}
                      </h3>

                      {/* Rules travel INSIDE the item they follow — a wrap can
                          only ever leave one at the left margin, never orphan
                          one where the eye starts the next line. */}
                      <div className="mt-3 flex flex-wrap items-center gap-y-2 text-meta text-muted-foreground">
                        {meta.map((m, j) => (
                          <span key={`${j}-${m}`} className="inline-flex items-center whitespace-nowrap">
                            {m}
                            {j < meta.length - 1 && (
                              <span aria-hidden="true" className="w-px h-4 bg-primary/45 shrink-0 mx-3" />
                            )}
                          </span>
                        ))}
                      </div>

                      {p.description && (
                        <p className="mt-4 max-w-2xl text-lede text-foreground-soft text-pretty">
                          {p.description}
                        </p>
                      )}

                      <div className="mt-7 max-w-2xl">
                        <div className="flex items-baseline justify-between text-meta text-muted-foreground">
                          <span>התקדמות</span>
                          <span className="tabular-nums">{p.progress}%</span>
                        </div>
                        <Progress value={p.progress} className="mt-2 h-2" />
                      </div>

                      {p.next_milestone && (
                        <p className="mt-6 text-lede text-foreground">
                          <span className="text-muted-foreground">אבן הדרך הבאה: </span>
                          {p.next_milestone}
                          {p.next_milestone_date && (
                            <span className="text-muted-foreground">
                              {" "}
                              · {new Date(p.next_milestone_date).toLocaleDateString("he-IL")}
                            </span>
                          )}
                        </p>
                      )}
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}

          {/* ————— FAVORITES ————— */}
          <div className="mt-16 md:mt-24 border-t border-border pt-14 md:pt-16">
            <Reveal>
              <SectionHeading align="start" as="h2">
                המועדפים שלי
              </SectionHeading>
            </Reveal>

            {/* Two loads stand between arriving and seeing the hearts: the
                favourite ids, then the products behind them. Without this gate
                the page states outright that nothing is saved, and then
                contradicts itself a moment later. */}
            {favLoading || (favIds.size > 0 && favProducts.length === 0) ? (
              <p className="mt-8 text-lede text-foreground-soft">טוען…</p>
            ) : favProducts.length === 0 ? (
              <Reveal className="mt-8 md:mt-10">
                <p className="max-w-2xl text-lede text-foreground-soft text-pretty">
                  עדיין לא שמרתם כאן מוצרים. לחצו על הלב שליד כל מוצר בקולקציות, והוא יחכה לכם כאן —
                  מכל מכשיר.
                </p>
                <div className="mt-7">
                  <ShineButton to="/collections">
                    לגילוי הקולקציות
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  </ShineButton>
                </div>
              </Reveal>
            ) : (
              <div className="mt-8 md:mt-10 grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 lg:gap-x-7 gap-y-10 md:gap-y-12">
                {favProducts.map((p, i) => (
                  <ProductCell
                    key={p.id}
                    product={toCellProduct(p)}
                    index={i}
                    lead={false}
                    eager={false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ————— DETAILS ————— */}
          <div className="mt-16 md:mt-24 border-t border-border pt-14 md:pt-16">
            <Reveal>
              <SectionHeading align="start" as="h2">
                הפרטים שלי
              </SectionHeading>
            </Reveal>

            <Reveal delay={100}>
              <form onSubmit={saveProfile} className="mt-8 md:mt-10 max-w-2xl">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fullName" className={labelClass}>
                      שם מלא
                    </label>
                    <input
                      id="fullName"
                      autoComplete="name"
                      className={fieldClass}
                      value={profile.full_name ?? ""}
                      onChange={(e) => setProfile((s) => ({ ...s, full_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      טלפון
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      className={fieldClass}
                      value={profile.phone ?? ""}
                      onChange={(e) => setProfile((s) => ({ ...s, phone: e.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className={labelClass}>
                      אימייל
                    </label>
                    {/* The address is the account key — shown, never edited
                        here, so it is left-aligned like every other Latin run
                        on the site. */}
                    <input
                      id="email"
                      dir="ltr"
                      value={user.email ?? ""}
                      readOnly
                      disabled
                      className={cn(fieldClass, "text-left disabled:cursor-not-allowed disabled:opacity-70")}
                    />
                    <p className="mt-2.5 text-meta text-muted-foreground">
                      לשינוי כתובת האימייל, צרו איתנו קשר.
                    </p>
                  </div>
                </div>
                <div className="mt-9">
                  <ShineAction type="submit" disabled={savingProfile}>
                    {savingProfile ? "שומר..." : "שמירת שינויים"}
                  </ShineAction>
                </div>
              </form>
            </Reveal>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Account;
