import { useState } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionLabel from "@/components/SectionLabel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { trackPixel } from "@/lib/pixel";

type Answers = {
  space_type: string;
  space_size: string;
  style: string;
  timeline: string;
  features: string[];
  contact_name: string;
  contact_phone: string;
  contact_email: string;
};

const initial: Answers = {
  space_type: "",
  space_size: "",
  style: "",
  timeline: "",
  features: [],
  contact_name: "",
  contact_phone: "",
  contact_email: "",
};

const spaceOptions = ["מרפסת דירה", "גג / פנטהאוז", "חצר פרטית", "אזור בריכה", "מסחרי / מלונאות"];
const sizeOptions = ["עד 15 מ״ר", "15–40 מ״ר", "40–80 מ״ר", "מעל 80 מ״ר"];
const styleOptions = ["מינימליסטי בהיר", "אורבני כהה", "ים-תיכוני חם", "טרופי / בוטני", "קלאסי יוקרתי"];
const timelineOptions = ["דחוף (חודש)", "תוך 3 חודשים", "תוך 6 חודשים", "מתכנן/ת לעתיד"];
const featureOptions = [
  "סלון חוץ",
  "פינת אוכל",
  "מטבח חוץ",
  "פרגולה / הצללה",
  "תאורת אווירה",
  "חימום",
  "ערסל / נדנדה",
  "מצעים ושטיחים",
];

const recommendFor = (a: Answers) => {
  if (a.space_type === "אזור בריכה") return "קולקציית Pool, סטים עמידים בכלור עם בדי Sunbrella ושלדת אלומיניום מוקצף.";
  if (a.style.includes("מינימליסטי")) return "קולקציית Soft Lines, סלוני חוץ נקיים בגווני אבן ולבן שמנת.";
  if (a.style.includes("ים-תיכוני")) return "קולקציית Mediterranean, טראקוטה, פשתן וגוונים חמים.";
  if (a.space_type.includes("גג")) return "קולקציית Skyline, מודולים גמישים לפנטהאוזים עם דגש על נוף.";
  return "קולקציית Signature, סלוני חוץ בהתאמה אישית עם בדי Sunbrella ושלדת אלומיניום.";
};

const steps = ["מרחב", "סגנון ולוח זמנים", "פיצ׳רים", "פרטי קשר"];

const Questionnaire = () => {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(initial);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const { user } = useAuth();

  const update = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((p) => ({ ...p, [k]: v }));
  const toggleFeature = (f: string) =>
    setA((p) => ({ ...p, features: p.features.includes(f) ? p.features.filter((x) => x !== f) : [...p.features, f] }));

  const canNext = () => {
    if (step === 0) return a.space_type && a.space_size;
    if (step === 1) return a.style && a.timeline;
    if (step === 2) return true;
    return a.contact_name && a.contact_phone;
  };

  const submit = async () => {
    setBusy(true);
    try {
      const recommendation = recommendFor(a);
      const { error } = await supabase.from("questionnaire_responses").insert({
        user_id: user?.id ?? null,
        contact_name: a.contact_name,
        contact_phone: a.contact_phone,
        contact_email: a.contact_email || null,
        space_type: a.space_type,
        space_size: a.space_size,
        style: a.style,
        timeline: a.timeline,
        features: a.features,
        recommendation,
      });
      if (error) throw error;
      setDone(recommendation);
      trackPixel("Lead", {
        content_name: "שאלון אפיון חכם",
        content_category: "Questionnaire",
      });
      toast.success("השאלון נשלח!");
    } catch (err: any) {
      toast.error(err?.message ?? "אירעה שגיאה");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="שאלון אפיון חכם | Aluma"
        description="ענו על 4 שאלות קצרות וקבלו המלצה אישית על קולקציית סלוני החוץ המתאימה למרחב שלכם."
        path="/questionnaire"
      />
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 gradient-cream">
        <div className="container-luxury text-center max-w-2xl">
          <SectionLabel he="שאלון חכם" en="Smart Match" className="text-xs mb-5" />
          <h1 className="font-display text-3xl md:text-5xl text-primary mb-4">
            נמצא לך את הקולקציה המושלמת
          </h1>
          <p className="text-primary/70">
            4 צעדים קצרים. בסוף תקבלו המלצה אישית והצעת פגישת אפיון ללא עלות.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-luxury max-w-2xl">
          {done ? (
            <div className="bg-background border border-border rounded-sm p-10 text-center shadow-luxury">
              <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-7 w-7 text-accent" />
              </div>
              <h2 className="font-display text-2xl text-primary mb-4">ההמלצה שלנו עבורך</h2>
              <p className="text-primary/80 text-lg mb-8 leading-relaxed">{done}</p>
              <p className="text-sm text-primary/60 mb-6">
                נחזור אליך תוך 24 שעות לתאם פגישת אפיון ללא עלות.
              </p>
              <a href="/collections">
                <Button>צפייה בקולקציות</Button>
              </a>
            </div>
          ) : (
            <div className="bg-background border border-border rounded-sm p-8 md:p-10 shadow-soft">
              <div className="mb-8">
                <div className="flex justify-between text-xs text-primary/60 mb-2">
                  <span>שלב {step + 1} מתוך {steps.length}</span>
                  <span>{steps[step]}</span>
                </div>
                <Progress value={((step + 1) / steps.length) * 100} />
              </div>

              {step === 0 && (
                <div className="space-y-6">
                  <FieldChoice label="איזה סוג מרחב?" value={a.space_type} options={spaceOptions} onChange={(v) => update("space_type", v)} />
                  <FieldChoice label="גודל משוער" value={a.space_size} options={sizeOptions} onChange={(v) => update("space_size", v)} />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <FieldChoice label="איזה סגנון מדבר אליך?" value={a.style} options={styleOptions} onChange={(v) => update("style", v)} />
                  <FieldChoice label="לוח זמנים" value={a.timeline} options={timelineOptions} onChange={(v) => update("timeline", v)} />
                </div>
              )}

              {step === 2 && (
                <div>
                  <Label className="block mb-4 text-primary">מה חשוב לכלול? (אופציונלי)</Label>
                  <div className="flex flex-wrap gap-2">
                    {featureOptions.map((f) => {
                      const active = a.features.includes(f);
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => toggleFeature(f)}
                          className={`px-4 py-2 rounded-sm border text-sm transition-smooth ${
                            active
                              ? "bg-accent text-accent-foreground border-accent"
                              : "bg-background border-border text-primary/80 hover:border-accent"
                          }`}
                        >
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="cname">שם מלא *</Label>
                    <Input id="cname" value={a.contact_name} onChange={(e) => update("contact_name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cphone">טלפון *</Label>
                    <Input id="cphone" type="tel" value={a.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cemail">אימייל</Label>
                    <Input id="cemail" type="email" dir="ltr" value={a.contact_email} onChange={(e) => update("contact_email", e.target.value)} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 mt-10 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0 || busy}
                >
                  הקודם
                </Button>
                {step < steps.length - 1 ? (
                  <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
                    הבא
                  </Button>
                ) : (
                  <Button onClick={submit} disabled={!canNext() || busy}>
                    {busy ? "שולח..." : "קבלת המלצה"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

const FieldChoice = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => (
  <div>
    <Label className="block mb-3 text-primary">{label}</Label>
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-4 py-3 rounded-sm border text-sm text-right transition-smooth ${
              active
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-background border-border text-primary/80 hover:border-accent"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

export default Questionnaire;
