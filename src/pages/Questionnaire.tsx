import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
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

/**
 * A one-line summary of the answers, stored alongside the lead so whoever picks
 * it up in the admin panel sees the shape of the request without opening every
 * field.
 *
 * This replaces a five-branch "recommendation engine" that named collections —
 * Pool, Soft Lines, Mediterranean, Skyline, Signature — which exist nowhere in
 * the catalogue, and which ignored three of the four things the form asks. A
 * real person reads these and answers properly.
 */
const summarise = (a: Answers) =>
  [a.space_type, a.space_size, a.style, a.timeline, a.features.join(", ")]
    .filter(Boolean)
    .join(" · ");

const steps = ["המרחב", "סגנון ולוח זמנים", "מה לכלול", "פרטי קשר"];

const Questionnaire = () => {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(initial);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
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
      const recommendation = summarise(a);
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
      setDone(true);
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
        title="ייעוץ אישי | Aluma"
        description="ספרו לנו על המרחב שלכם בכמה שאלות קצרות, ומעצב מהצוות יחזור אליכם עם המלצה אישית — בלי עלות ובלי התחייבות."
        path="/consult"
      />
      <PageHero
        title="ייעוץ אישי"
        subtitle="כמה שאלות קצרות על המרחב שלכם, ומעצב מהצוות חוזר אליכם עם המלצה אישית. בלי עלות, בלי התחייבות."
      />

      <section className="py-16 md:py-20">
        <div className="container-luxury max-w-2xl">
          {done ? (
            <div className="bg-background border border-border rounded-sm p-10 text-center shadow-luxury">
              <div className="w-14 h-14 bg-accent/10 rounded-sm flex items-center justify-center mx-auto mb-6">
                <Check className="h-7 w-7 text-accent" />
              </div>
              <h2 className="font-display text-2xl text-primary mb-4">קיבלנו, תודה</h2>
              <p className="text-foreground text-lg mb-3 leading-relaxed">
                מעצב מהצוות שלנו יעבור על מה שכתבתם ויחזור אליכם תוך 24 שעות עם
                המלצה שמתאימה למרחב שלכם.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                בינתיים — אתם מוזמנים להסתובב בקולקציות.
              </p>
              <Link to="/collections">
                <Button>לקולקציות</Button>
              </Link>
            </div>
          ) : (
            <div className="bg-background border border-border rounded-sm p-8 md:p-10 shadow-soft">
              <div className="mb-8">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
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
                  <Label className="block mb-4 text-foreground">מה חשוב לכלול? (אופציונלי)</Label>
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
                              : "bg-background border-border text-foreground hover:border-accent"
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
    <Label className="block mb-3 text-foreground">{label}</Label>
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
                : "bg-background border-border text-foreground hover:border-accent"
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
