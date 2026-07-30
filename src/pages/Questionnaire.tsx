import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import ShineButton from "@/components/ui/shine-button";
import ShineAction from "@/components/ui/shine-action";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, Check } from "lucide-react";
import { trackPixel } from "@/lib/pixel";
import { waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { demoCollections } from "@/data/demoCollections";
import type { DBCollection } from "@/hooks/useCollectionsData";

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

// The same four labels the DIY page's station-04 rail promises — the two rails
// must never drift apart, and "פיצ׳רים" was not Hebrew anyone says out loud.
const steps = ["המרחב", "סגנון ולוח זמנים", "מה לכלול", "פרטי קשר"];

/**
 * Maps the answers onto one of the real collections in the catalogue, by slug —
 * the result card looks the collection up in demoCollections and links straight
 * into /collections?cat=<slug>, so this must only ever return slugs that exist
 * there. Priority runs from the most specific signal to the most generic:
 * a pool or a swing wish beats a style, a style beats the roof, and the salons
 * are the catch-all because every space can carry one.
 */
const recommendFor = (a: Answers): string => {
  const wants = (f: string) => a.features.some((x) => x.includes(f));
  // Pool spaces and sun/swing wishes → loungers and hanging swings.
  if (a.space_type.includes("בריכה") || wants("ערסל")) return "lounge";
  // A clean, minimal brief → the modular outdoor salons.
  if (a.style.includes("מינימליסטי")) return "salons";
  // Evening hosting: heating or ambience lighting → the fire tables.
  if (wants("חימום") || wants("תאורת")) return "fire-tables";
  // Rooftops and outdoor kitchens → the bar corners.
  if (a.space_type.includes("גג") || wants("מטבח")) return "bar";
  if (wants("פינת אוכל")) return "dining";
  return "salons";
};

const collectionFor = (slug: string): DBCollection =>
  demoCollections.find((c) => c.slug === slug) ?? demoCollections[0];

/**
 * The quiet second action on the result card: a WhatsApp chat that opens with
 * the collection named and the answers already summarised, so nobody has to
 * repeat what they just filled in.
 */
const waSummaryLink = (a: Answers, rec: DBCollection) => {
  const line = [a.space_type, a.space_size, a.style, a.timeline].filter(Boolean).join(", ");
  const wants = a.features.length ? `. חשוב לי לכלול: ${a.features.join(", ")}` : "";
  return waLink(`קולקציית ${rec.name_he}. מילאתי את השאלון באתר — ${line}${wants}`);
};

// Field grammar borrowed from the contact form: 10px control radius, 18px ink,
// no outline-none — the global focus-visible ring is what keyboard users see.
const inputClass =
  "h-14 w-full rounded-[10px] border border-border bg-background px-5 text-meta text-foreground text-right placeholder:text-muted-foreground/70 transition-smooth focus:border-primary focus:ring-4 focus:ring-primary/15";
const labelClass = "mb-2.5 block font-display text-meta font-medium text-foreground";

// One chip grammar for everything selectable on this page: 10px radius, 18px
// ink, and the selected state is a charcoal fill — not the accent, which is
// reserved for text links.
const chipOn = "bg-foreground text-background border-foreground";
const chipOff = "bg-background border-border text-foreground hover:border-primary/50";

/**
 * The step rail that replaced the progress bar: the four labelled chips joined
 * by hairlines, exactly the specimen the DIY plank shows for this tool. The
 * current chip is filled charcoal, finished ones carry a check, future ones
 * stay muted. Below sm the connectors go fixed-width and the rail wraps;
 * from sm the connectors take all the slack so the rail spans the card.
 */
const StepRail = ({ current }: { current: number }) => (
  <ol className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
    {steps.map((label, i) => {
      const isDone = i < current;
      const isNow = i === current;
      return (
        <li key={label} className="flex items-center gap-3 sm:flex-1 sm:last:flex-none">
          <span
            aria-current={isNow ? "step" : undefined}
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap rounded-[10px] border px-4 py-2 text-meta transition-colors duration-300",
              isNow && "border-foreground bg-foreground text-background",
              isDone && "border-primary/50 text-foreground",
              !isNow && !isDone && "border-border text-muted-foreground"
            )}
          >
            {isDone && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
            {label}
          </span>
          {i < steps.length - 1 && (
            <span
              className="h-px w-5 shrink-0 bg-primary/45 sm:w-auto sm:flex-1"
              aria-hidden="true"
            />
          )}
        </li>
      );
    })}
  </ol>
);

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

  // `done` holds the recommended slug once the answers are in; from there the
  // card renders the real collection, not a sentence about one.
  const rec = done ? collectionFor(done) : null;

  return (
    <Layout>
      <SEO
        title="שאלון אפיון חכם | Aluma"
        description="ענו על 4 שאלות קצרות וקבלו המלצה אישית על קולקציית סלוני החוץ המתאימה למרחב שלכם."
        path="/questionnaire"
      />
      <PageHero
        title="שאלון חכם"
        subtitle="ארבעה שלבים קצרים על המרחב, על הסגנון ועל לוח הזמנים שלכם, ובסופם המלצה על הקולקציה שמתאימה לכם ביותר."
      />

      <section className="py-16 md:py-20">
        <div className="container-luxury max-w-2xl">
          {rec ? (
            /* ===== The result: the actual recommended collection ===== */
            <Reveal>
              <div className="overflow-hidden rounded-[14px] border border-border bg-background shadow-luxury">
                {rec.image_url && (
                  <Link
                    to={`/collections?cat=${rec.slug}`}
                    className="group block"
                    aria-label={`קולקציית ${rec.name_he}`}
                  >
                    {/* Zoom lives on a wrapper, never on the <img> itself —
                        scaling the image drags the card's top corners. */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                      <div className="absolute inset-0 transition-transform duration-600 ease-out group-hover:scale-[1.06]">
                        <img
                          src={rec.image_url}
                          alt={`קולקציית ${rec.name_he} | Aluma`}
                          width={1024}
                          height={576}
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </Link>
                )}

                <div className="p-6 text-right sm:p-8 md:p-10">
                  <p className="flex items-center gap-2.5 text-meta text-muted-foreground">
                    <Check className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    ההמלצה שלנו עבורכם
                  </p>
                  <h2 className="mt-3 font-display font-normal text-card text-foreground">
                    קולקציית {rec.name_he}
                  </h2>
                  {rec.intro && (
                    <p className="mt-3 text-lede text-foreground-soft text-pretty">{rec.intro}</p>
                  )}
                  <p className="mt-6 text-meta text-muted-foreground">
                    נחזור אליכם בתוך 24 שעות לתיאום פגישת אפיון ללא עלות.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5 border-t border-border pt-7">
                    <ShineButton to={`/collections?cat=${rec.slug}`}>
                      לצפייה בקולקציה
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    </ShineButton>
                    {/* Opens WhatsApp with the answers already written out. */}
                    <a
                      href={waSummaryLink(a, rec)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-meta text-accent link-underline transition-smooth"
                    >
                      להמשך התאמה בוואטסאפ
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          ) : (
            /* ===== The wizard ===== */
            <Reveal>
              <div className="rounded-[14px] border border-border bg-background p-6 shadow-soft sm:p-8 md:p-10">
                <StepRail current={step} />

                <div className="mt-10">
                  {step === 0 && (
                    <div className="space-y-6">
                      <FieldChoice label="איזה סוג מרחב?" value={a.space_type} options={spaceOptions} onChange={(v) => update("space_type", v)} />
                      <FieldChoice label="גודל משוער" value={a.space_size} options={sizeOptions} onChange={(v) => update("space_size", v)} />
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-6">
                      <FieldChoice label="איזה סגנון מדבר אליכם?" value={a.style} options={styleOptions} onChange={(v) => update("style", v)} />
                      <FieldChoice label="לוח זמנים" value={a.timeline} options={timelineOptions} onChange={(v) => update("timeline", v)} />
                    </div>
                  )}

                  {step === 2 && (
                    <fieldset>
                      <legend className={cn(labelClass, "mb-4")}>מה חשוב לכלול? (אופציונלי)</legend>
                      <div className="flex flex-wrap gap-2.5">
                        {featureOptions.map((f) => {
                          const active = a.features.includes(f);
                          return (
                            <button
                              key={f}
                              type="button"
                              onClick={() => toggleFeature(f)}
                              aria-pressed={active}
                              className={cn(
                                "inline-flex items-center gap-2 rounded-[10px] border px-4 py-2 text-meta transition-smooth",
                                active ? chipOn : chipOff
                              )}
                            >
                              {active && <Check className="h-4 w-4" aria-hidden="true" />}
                              {f}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  )}

                  {step === 3 && (
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="cname" className={labelClass}>
                          שם מלא *
                        </label>
                        <input
                          id="cname"
                          autoComplete="name"
                          value={a.contact_name}
                          onChange={(e) => update("contact_name", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="cphone" className={labelClass}>
                          טלפון *
                        </label>
                        <input
                          id="cphone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={a.contact_phone}
                          onChange={(e) => update("contact_phone", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="cemail" className={labelClass}>
                          אימייל
                        </label>
                        <input
                          id="cemail"
                          type="email"
                          dir="ltr"
                          inputMode="email"
                          autoComplete="email"
                          value={a.contact_email}
                          onChange={(e) => update("contact_email", e.target.value)}
                          className={cn(inputClass, "text-left")}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Back is a quiet text link on the right (the RTL start), the
                    primary action sits at the far left — the forward side. */}
                <div className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => Math.max(0, s - 1))}
                      disabled={busy}
                      className="text-meta text-muted-foreground link-underline transition-smooth hover:text-foreground disabled:opacity-50"
                    >
                      הקודם
                    </button>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                  {step < steps.length - 1 ? (
                    <ShineAction
                      onClick={() => setStep((s) => s + 1)}
                      disabled={!canNext()}
                      className="disabled:pointer-events-none disabled:opacity-45"
                    >
                      הבא
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    </ShineAction>
                  ) : (
                    <ShineAction
                      onClick={submit}
                      disabled={!canNext() || busy}
                      className="disabled:pointer-events-none disabled:opacity-45"
                    >
                      {busy ? "שולח..." : "קבלת המלצה"}
                    </ShineAction>
                  )}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </Layout>
  );
};

/**
 * A single-choice question: a fieldset of bordered tiles that fill charcoal
 * when picked. Buttons with aria-pressed rather than radios, so the tiles keep
 * their tap-target size without a hidden-input dance.
 */
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
  <fieldset>
    <legend className={cn(labelClass, "mb-3")}>{label}</legend>
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={active}
            className={cn(
              "rounded-[10px] border px-4 py-3 text-right text-meta transition-smooth",
              active ? chipOn : chipOff
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </fieldset>
);

export default Questionnaire;
