import { useRef, useState } from "react";
import { AlertCircle, Check, ChevronDown, Loader2, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { contactSchema } from "@/lib/contactSchema";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/config/site";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { cn } from "@/lib/utils";

interface ShowroomVisitProps {
  /** Anchor the product panel's quiet link scrolls to. */
  id: string;
  /** Named in the lead so the studio knows what to lay out before you arrive. */
  productName: string;
}

const DAYS = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "גמיש, כל יום מתאים",
];

const FIELD_LABELS: Record<string, string> = {
  name: "שם",
  phone: "טלפון",
  day: "יום מועדף",
};

// Same guards as the contact page: a form filled faster than a human could
// read it, or a second send inside half a minute, is a bot.
const COOLDOWN_MS = 30_000;
const MIN_FILL_MS = 2_500;

const labelClass = "block font-display text-meta font-medium text-background mb-2.5";

/**
 * The contact page's field, inverted for charcoal. Radius is the site's control
 * radius (10px) rather than the 14px reserved for cards and panels, and there
 * is deliberately no `outline-none` — the global focus-visible ring is what
 * keyboard users navigate by.
 *
 * The invalid border is a lightened red rather than `border-destructive`:
 * --destructive measures about 2.2:1 against this charcoal, which is under the
 * 3:1 floor even for a non-text edge. Same reason the error ink below is
 * warm white with the red carried by the icon.
 */
const fieldClass = (invalid: boolean) =>
  cn(
    "w-full h-14 rounded-[10px] border bg-background/10 px-5 text-meta text-background",
    // /60, not /50: warm white at 50% over this charcoal measures 4.37:1, just
    // under the 4.5:1 body-text floor. 60% clears it at 5.6:1.
    "placeholder:text-background/60 transition-smooth focus:ring-4 focus:ring-background/15",
    invalid
      ? "border-[hsl(0_72%_72%)] focus:border-[hsl(0_72%_72%)]"
      : "border-background/25 focus:border-background/70",
  );

const FieldError = ({ id, message }: { id: string; message: string }) => (
  <p id={id} className="mt-2.5 flex items-start gap-2.5 text-meta leading-snug text-background">
    <AlertCircle
      className="mt-[3px] h-[18px] w-[18px] shrink-0 text-[hsl(0_72%_72%)]"
      aria-hidden="true"
    />
    {message}
  </p>
);

/**
 * The page's one charcoal band, carrying the showroom invitation.
 *
 * A product page's real second act is not another "leave your details" panel —
 * it is getting the visitor into the room where the piece is standing. Three
 * fields only: who, which number, which day. Everything else the studio needs
 * (which product, that this came off a product page) is written into the lead
 * for them, so the visitor never types it.
 *
 * Posts to the same submit-contact edge function as the contact page, tagged
 * source:"visit" so a showroom booking is distinguishable from a general
 * enquiry in the admin lead list. On success the form is replaced in place —
 * nobody is thrown off a product page they were still reading.
 */
const ShowroomVisit = ({ id, productName }: ShowroomVisitProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const formMountedAt = useRef<number>(Date.now());
  const lastSubmitAt = useRef<number>(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const now = Date.now();

    if (now - formMountedAt.current < MIN_FILL_MS) {
      toast.error("נא לנסות שוב בעוד רגע");
      return;
    }
    if (now - lastSubmitAt.current < COOLDOWN_MS) {
      const secs = Math.ceil((COOLDOWN_MS - (now - lastSubmitAt.current)) / 1000);
      toast.error(`נשלחה בקשה לאחרונה, נסו שוב בעוד ${secs} שניות`);
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);
    const day = String(data.get("day") || "");
    const website = String(data.get("website") || "");

    // Honeypot — behave exactly like a success, write nothing.
    if (website) {
      setSent(true);
      return;
    }

    const parsed = contactSchema.safeParse({
      name: String(data.get("name") || ""),
      phone: String(data.get("phone") || ""),
      email: "",
      message: `בקשה לתיאום ביקור באולם התצוגה. פריט: ${productName}. יום מועדף: ${day}.`,
      website,
    });

    const fieldErrors: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
    }
    // The day is not part of the shared contact schema — it belongs to this
    // form alone — so it is checked here and merged into the same error map.
    if (!day) fieldErrors.day = "יש לבחור יום מועדף";

    const firstKey = Object.keys(fieldErrors)[0];
    if (!parsed.success || firstKey) {
      setErrors(fieldErrors);
      toast.error("יש לתקן את השדות המסומנים");
      // Send focus to the first field that failed, so a keyboard or screen
      // reader user lands on the problem instead of hunting for it.
      if (firstKey) form.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);
    lastSubmitAt.current = now;

    try {
      const { data: result, error } = await supabase.functions.invoke("submit-contact", {
        body: { ...parsed.data, source: "visit" },
      });

      if (error) {
        // Try to extract a structured error message from the edge function.
        const ctx = (error as { context?: Response }).context;
        let serverMsg = "שגיאה בשליחה. נסו שוב או צרו קשר בטלפון.";
        if (ctx) {
          try {
            const body = await ctx.json();
            if (body?.error) serverMsg = body.error;
            if (ctx.status === 429)
              serverMsg = body?.error ?? "נשלחו יותר מדי פניות. נסו שוב מאוחר יותר.";
          } catch {
            /* ignore */
          }
        }
        toast.error(serverMsg);
      } else if (result?.ok) {
        setSent(true);
      } else {
        toast.error("שגיאה לא צפויה. נסו שוב.");
      }
    } catch (err) {
      console.error(err);
      toast.error("שגיאת רשת. בדקו חיבור ונסו שוב.");
    } finally {
      setSubmitting(false);
    }
  };

  const errorList = Object.entries(errors);

  return (
    // scroll-mt-28, matching the contact page's showroom band: the header is
    // h-24 (96px) and fixed, so a 96px offset would land the band's top edge
    // exactly under it with nothing to spare.
    <section id={id} className="relative grain scroll-mt-28 bg-foreground py-20 md:py-28">
      <div className="container-luxury">
        {/* RTL: the invitation is the first child, so it reads first on the
            right; the form sits alongside it on the left. */}
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <Reveal className="min-w-0">
            <SectionHeading
              light
              align="start"
              // "איך הוא יושב" is an English calque — in Hebrew that reads as
              // how the piece sits in the space, not how it feels to sit on.
              subtitle="תמונה מראה איך פריט נראה, לא איך מרגיש לשבת עליו. באולם ביציץ אפשר לשבת על המערכות, למשש את הבדים, לראות את לוחות הפורצלן מקרוב ולסגור גוונים מול העין."
            >
              בואו לשבת על זה
            </SectionHeading>

            <ul className="mt-9 space-y-4">
              <li className="flex items-center gap-3 text-meta text-background/80">
                <MapPin className="h-[18px] w-[18px] shrink-0 text-primary" aria-hidden="true" />
                {SITE.address.full}
              </li>
              <li>
                <a
                  href={`tel:${SITE.phone.tel}`}
                  className="link-underline inline-flex items-center gap-3 text-meta text-background/80 transition-colors hover:text-background"
                >
                  <Phone className="h-[18px] w-[18px] shrink-0 text-primary" aria-hidden="true" />
                  <bdi dir="ltr">{SITE.phone.display}</bdi>
                </a>
              </li>
              <li className="flex items-center gap-3 text-meta text-background/80">
                <span className="h-px w-[18px] shrink-0 bg-primary" aria-hidden="true" />
                הביקור בתיאום מראש, כדי שנפנה לכם את הזמן
              </li>
            </ul>
          </Reveal>

          <Reveal delay={120} className="min-w-0">
            {sent ? (
              <div
                role="status"
                className="rounded-[14px] border border-background/25 bg-background/10 p-7 md:p-9"
              >
                <div className="flex items-start gap-4">
                  <Check
                    className="mt-1 h-6 w-6 shrink-0 text-primary"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="font-display text-[22px] leading-snug text-background">
                      הבקשה נקלטה
                    </p>
                    {/* Phrased "שתראו את X" on purpose: a product name can be
                        masculine or feminine, and nothing here has to agree
                        with it. */}
                    <p className="mt-3 text-meta leading-relaxed text-background/80">
                      נחזור אליכם טלפונית לאישור המועד, ונדאג שתראו את {productName} באולם
                      כשתגיעו.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* Honeypot. Deliberately NOT parked at left:-9999px: this
                    document is dir="rtl", where the left side is the overflow
                    direction, so an off-canvas box there drags ~9999px of
                    horizontal scroll onto the page. Clipped in place instead. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none h-px w-px overflow-hidden opacity-0"
                  style={{ position: "absolute", clipPath: "inset(50%)" }}
                >
                  <label>
                    Website
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                {errorList.length > 0 && (
                  <div
                    role="alert"
                    className="mb-7 rounded-[14px] border border-[hsl(0_72%_72%_/_0.5)] bg-background/[0.07] p-5 text-right"
                  >
                    <p className="flex items-center gap-2.5 text-meta font-medium text-background">
                      <AlertCircle
                        className="h-5 w-5 shrink-0 text-[hsl(0_72%_72%)]"
                        aria-hidden="true"
                      />
                      לא הצלחנו לשלוח, יש לתקן את השדות המסומנים
                    </p>
                    <ul className="mt-3 space-y-1.5 text-meta leading-snug text-background/85">
                      {errorList.map(([key, message]) => (
                        <li key={key}>
                          {FIELD_LABELS[key] ?? key}: {message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="visit-name" className={labelClass}>
                      שם מלא
                    </label>
                    <input
                      id="visit-name"
                      name="name"
                      required
                      maxLength={100}
                      autoComplete="name"
                      placeholder="השם שלכם"
                      dir="rtl"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "visit-name-error" : undefined}
                      className={fieldClass(!!errors.name)}
                    />
                    {errors.name && <FieldError id="visit-name-error" message={errors.name} />}
                  </div>

                  <div>
                    <label htmlFor="visit-phone" className={labelClass}>
                      טלפון
                    </label>
                    <input
                      id="visit-phone"
                      name="phone"
                      required
                      type="tel"
                      maxLength={20}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="טלפון נייד לחזרה"
                      dir="rtl"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "visit-phone-error" : undefined}
                      className={fieldClass(!!errors.phone)}
                    />
                    {errors.phone && <FieldError id="visit-phone-error" message={errors.phone} />}
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="visit-day" className={labelClass}>
                    יום מועדף
                  </label>
                  {/* Native select, stripped of its own arrow so the cue can sit
                      on the inline-END edge — the left, in RTL. The options are
                      given explicit ink: an option list that inherits the light
                      text of a charcoal field renders white on white in the OS
                      popup on Windows. */}
                  <div className="relative">
                    <select
                      id="visit-day"
                      name="day"
                      required
                      defaultValue=""
                      dir="rtl"
                      aria-invalid={!!errors.day}
                      aria-describedby={errors.day ? "visit-day-error" : undefined}
                      className={cn(fieldClass(!!errors.day), "appearance-none pe-12")}
                    >
                      <option value="" disabled className="bg-background text-foreground">
                        בחרו יום
                      </option>
                      {DAYS.map((d) => (
                        <option key={d} value={d} className="bg-background text-foreground">
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute end-5 top-1/2 h-5 w-5 -translate-y-1/2 text-background/60"
                      aria-hidden="true"
                    />
                  </div>
                  {errors.day && <FieldError id="visit-day-error" message={errors.day} />}
                </div>

                <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={submitting}
                    aria-busy={submitting}
                    // min-w holds the width across the label swap, so the row
                    // does not jump the moment you press send.
                    className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-[10px] bg-background px-9 text-meta font-medium text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-luxury disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[13rem]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        שולחים…
                      </>
                    ) : (
                      "לתיאום הביקור"
                    )}
                  </button>

                  <p className="text-meta leading-snug text-background/60 sm:max-w-[16rem]">
                    הפרטים משמשים לתיאום הביקור בלבד.
                  </p>
                </div>

                <p className="sr-only" role="status" aria-live="polite">
                  {submitting ? "שולחים את הבקשה, רגע אחד" : ""}
                </p>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default ShowroomVisit;
