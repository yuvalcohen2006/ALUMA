import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { contactSchema } from "@/lib/contactSchema";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/config/site";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Direct channels — the left column of the split (RTL: the second DOM child).
   Every tile is a real target: three of them leave the page (WhatsApp, phone,
   mail) and the fourth walks you down to the charcoal showroom band, so the
   page holds together instead of ending in a dead card.
--------------------------------------------------------------------------- */

type Channel = {
  key: string;
  Icon: React.ComponentType<{ className?: string }>;
  /** Warm terracotta wash by default; WhatsApp keeps its own brand green. */
  iconClass: string;
  /**
   * Optical size correction for the glyph inside the 48px chip. Lucide icons
   * are 2px strokes and sit right at 24px; the WhatsApp mark is a solid fill,
   * which reads noticeably heavier at the same measure — so it is set smaller.
   */
  glyphClass?: string;
  title: string;
  /** Latin-only titles (phone, mail) must render LTR inside the RTL block. */
  ltr?: boolean;
  line: string;
  href?: string;
  external?: boolean;
};

const channels: Channel[] = [
  {
    key: "whatsapp",
    Icon: WhatsAppIcon,
    iconClass: "bg-[#25D366]/10 text-[#25D366]",
    glyphClass: "w-[22px] h-[22px]",
    title: "שליחת הודעת וואטסאפ",
    line: "מענה אנושי מהיר, גם לתמונות מהחצר",
    href: SITE.whatsapp.link("היי, אשמח לשמוע על סלון חוץ בהתאמה אישית"),
    external: true,
  },
  {
    key: "phone",
    Icon: Phone,
    iconClass: "bg-primary/10 text-accent",
    title: SITE.phone.display,
    ltr: true,
    line: "מדברים איתנו ישירות, בשעות הפעילות",
    href: `tel:${SITE.phone.tel}`,
  },
  {
    key: "email",
    Icon: Mail,
    iconClass: "bg-primary/10 text-accent",
    title: SITE.email,
    ltr: true,
    // Deliberately not the 24-hour promise: that line already sits, word for
    // word, in the assurances beside the form — two identical sentences a few
    // centimetres apart read as a copy-paste slip.
    line: "נוח לשליחת מידות, תוכניות וקבצים",
    href: `mailto:${SITE.email}`,
  },
  {
    key: "showroom",
    Icon: MapPin,
    iconClass: "bg-primary/10 text-accent",
    title: `אולם התצוגה ב${SITE.address.city}`,
    // The street stays on the tile. This is the one channel whose whole subject
    // is "where", and a visitor scanning the four tiles should get the answer
    // without a click — the band a screen below is the detail, not the source.
    line: `${SITE.address.street}, ביקור בתיאום מראש`,
  },
];

const scrollToShowroom = () => {
  const el = document.getElementById("showroom");
  if (!el) return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
};

const tileClass =
  "group flex w-full items-center gap-4 rounded-[14px] border border-border bg-background p-5 text-right shadow-soft transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/60 hover:shadow-luxury";

const ChannelTile = ({ channel }: { channel: Channel }) => {
  const { Icon } = channel;
  // The showroom tile is the only one that stays on the page. Its cue points
  // down, where it actually goes, instead of promising a departure it never
  // makes — same weight, same slot, so the four tiles still read as a set.
  const jumps = !channel.href;
  const Cue = jumps ? ChevronDown : ChevronLeft;

  const inner = (
    <>
      <span
        className={cn(
          "shrink-0 w-12 h-12 rounded-[10px] flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.06]",
          channel.iconClass,
        )}
      >
        <Icon className={channel.glyphClass ?? "w-6 h-6"} />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block font-display font-normal text-card-title leading-snug text-foreground",
            // A latin string inside an RTL block: flip the element to LTR so the
            // digits read correctly, then pin it back to the right edge.
            channel.ltr && "text-right",
          )}
          dir={channel.ltr ? "ltr" : undefined}
        >
          {channel.title}
        </span>
        <span className="block text-meta leading-snug text-muted-foreground mt-1.5">
          {channel.line}
        </span>
      </span>

      {/* RTL: forward points left */}
      <Cue
        className={cn(
          "w-5 h-5 shrink-0 text-primary/60 transition-all duration-300 group-hover:text-primary",
          jumps ? "group-hover:translate-y-0.5" : "group-hover:-translate-x-1",
        )}
        aria-hidden="true"
      />
    </>
  );

  if (!channel.href) {
    return (
      <button type="button" onClick={scrollToShowroom} className={tileClass}>
        {inner}
      </button>
    );
  }

  return (
    <a
      href={channel.href}
      className={tileClass}
      {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {inner}
    </a>
  );
};

/* ---------------------------------------------------------------------------
   The form
--------------------------------------------------------------------------- */

const FIELD_LABELS: Record<string, string> = {
  name: "שם",
  phone: "טלפון",
  email: "מייל",
  message: "הודעה",
};

const assurances = [
  "מענה תוך 24 שעות בימי עסקים",
  "ייעוץ ללא עלות וללא התחייבות",
  "פרטיכם נשמרים אצלנו בלבד",
];

// Tall, generously padded fields. Radius is the site's control radius (10px,
// the same tablet the buttons and pills use) rather than the 14px reserved for
// cards and panels. Deliberately no `outline-none`: the global focus-visible
// ring in index.css is what keyboard users navigate by.
const fieldClass = (invalid: boolean) =>
  cn(
    "w-full rounded-[10px] border bg-background px-5 text-meta text-foreground text-right",
    "placeholder:text-muted-foreground/70 transition-smooth focus:ring-4 focus:ring-primary/15",
    invalid ? "border-destructive/70 focus:border-destructive" : "border-border focus:border-primary",
  );

const labelClass = "block font-display text-meta font-medium text-foreground mb-2.5";

const FieldError = ({ id, message }: { id: string; message: string }) => (
  <p id={id} className="mt-2.5 flex items-start gap-2.5 text-meta leading-snug text-destructive">
    {/* 18px at leading-snug is a ~25px line box; a 18px glyph centres on it at
        3px, not at the 6px a plain spacing step would give. */}
    <AlertCircle className="w-[18px] h-[18px] mt-[3px] shrink-0" aria-hidden="true" />
    {message}
  </p>
);

const COOLDOWN_MS = 30_000;
const MIN_FILL_MS = 2_500;

const Contact = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
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
      toast.error(`נשלחה הודעה לאחרונה, נסו שוב בעוד ${secs} שניות`);
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || ""),
      phone: String(data.get("phone") || ""),
      email: String(data.get("email") || ""),
      message: String(data.get("message") || ""),
      website: String(data.get("website") || ""),
    };

    if (payload.website) {
      toast.success("תודה! נחזור אליכם בהקדם");
      form.reset();
      return;
    }

    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("יש לתקן את השדות המסומנים");
      // Send focus to the first field that failed, so a keyboard/screen-reader
      // user lands on the problem instead of hunting for it.
      const firstKey = parsed.error.issues[0]?.path[0] as string | undefined;
      if (firstKey) {
        form.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
      }
      return;
    }

    setErrors({});
    setSubmitting(true);
    lastSubmitAt.current = now;

    try {
      const { data: result, error } = await supabase.functions.invoke("submit-contact", {
        body: { ...parsed.data, source: "contact-page" },
      });

      if (error) {
        // Try to extract structured error message from edge function response
        const ctx = (error as { context?: Response }).context;
        let serverMsg = "שגיאה בשליחה. נסו שוב או צרו קשר בטלפון.";
        if (ctx) {
          try {
            const body = await ctx.json();
            if (body?.error) serverMsg = body.error;
            if (ctx.status === 429) serverMsg = body?.error ?? "נשלחו יותר מדי פניות. נסו שוב מאוחר יותר.";
          } catch {
            /* ignore */
          }
        }
        toast.error(serverMsg);
      } else if (result?.ok) {
        form.reset();
        formMountedAt.current = Date.now();
        navigate("/thank-you");
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
    // The top margin is what keeps the sand edge off the hero: PageHero closes
    // on 24px of its own padding, so without it the colour change lands almost
    // on the subtitle's last line.
    <section id="contact" dir="rtl" className="mt-10 md:mt-12 py-16 md:py-24 bg-secondary">
      <div className="container-luxury">
        {/* The split: the form takes the wider right column (first child in RTL),
            the direct channels ride alongside it on the left and stay put while
            the form scrolls. */}
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start max-w-6xl mx-auto">
          {/* ===== FORM ===== */}
          {/* Stacked on a phone the form runs ~1000px, so putting it first
              meant scrolling past all of it to reach a phone number. The
              channels lead on mobile; from lg the two sit side by side and the
              form takes the right (RTL start) column again. */}
          <Reveal className="order-2 lg:order-1 min-w-0">
            <SectionHeading
              align="start"
              tone="charcoal"
              subtitle="ספרו לנו מה החלום שלכם ואנחנו נדאג להגשים לכם אותו."
            >
              כתבו לנו
            </SectionHeading>

            {/* Close to the heading (24px) because it belongs to it, and a full
                36px clear of the form below — related things near, the change
                of gear far. */}
            <ul className="mt-6 flex flex-col gap-3 text-meta text-foreground-soft">
              {assurances.map((a) => (
                <li key={a} className="flex items-center gap-3">
                  {/* Deeper terracotta, not primary: this band is sand, where
                      primary measures ~2.5:1 — under the 3:1 floor even for a
                      decorative glyph. text-accent clears it at ~3.3:1. */}
                  <Check
                    className="w-[18px] h-[18px] shrink-0 text-accent"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  {a}
                </li>
              ))}
            </ul>

            <form onSubmit={handleSubmit} className="mt-9" noValidate>
              {/* Honeypot, hidden from real users. Deliberately NOT parked at
                  left:-9999px like the classic recipe: this document is
                  dir="rtl", where the left side is the scrollable overflow
                  direction, so an off-canvas box there drags ~9999px of
                  horizontal scroll onto the whole page. Clipped in place
                  instead — still a plain, fillable input in the markup. */}
              <div
                aria-hidden="true"
                className="w-px h-px overflow-hidden opacity-0 pointer-events-none"
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
                  className="mb-7 rounded-[14px] border border-destructive/40 bg-destructive/5 p-5 text-right"
                >
                  <p className="flex items-center gap-2.5 text-meta font-medium text-destructive">
                    <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                    לא הצלחנו לשלוח, יש לתקן את השדות המסומנים
                  </p>
                  <ul className="mt-3 space-y-1.5 text-meta leading-snug text-destructive">
                    {errorList.map(([key, message]) => (
                      <li key={key}>
                        {FIELD_LABELS[key] ?? key}: {message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* One vertical step for the whole field stack. The asterisk key
                  is stated before the first asterisk is met, not after the
                  last — a note that explains a convention has to precede it. */}
              <div className="space-y-6">
                {/* Charcoal asterisk, not terracotta. This whole section sits
                    on sand, where text-accent measures ~3.3:1 — under AA for
                    18px. On sand the ink is charcoal and the terracotta stays
                    in the rules, exactly as the projects index does it. */}
                <p className="text-meta leading-snug text-muted-foreground">
                  השדות המסומנים ב־<span className="font-medium text-foreground">*</span> הם שדות
                  חובה
                </p>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className={labelClass}>
                      שם מלא *
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      required
                      maxLength={100}
                      autoComplete="name"
                      placeholder="השם שלכם"
                      dir="rtl"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                      className={cn(fieldClass(!!errors.name), "h-14")}
                    />
                    {errors.name && <FieldError id="contact-name-error" message={errors.name} />}
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className={labelClass}>
                      טלפון *
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      required
                      type="tel"
                      maxLength={20}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="טלפון נייד לחזרה"
                      dir="rtl"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                      className={cn(fieldClass(!!errors.phone), "h-14")}
                    />
                    {errors.phone && <FieldError id="contact-phone-error" message={errors.phone} />}
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-email" className={labelClass}>
                    מייל <span className="font-normal text-muted-foreground">(לא חובה)</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    maxLength={255}
                    autoComplete="email"
                    placeholder="כתובת מייל"
                    dir="rtl"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                    className={cn(fieldClass(!!errors.email), "h-14")}
                  />
                  {errors.email && <FieldError id="contact-email-error" message={errors.email} />}
                </div>

                <div>
                  <label htmlFor="contact-message" className={labelClass}>
                    ספרו לנו על הפרויקט שלכם{" "}
                    <span className="font-normal text-muted-foreground">(לא חובה)</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    maxLength={1000}
                    rows={7}
                    dir="rtl"
                    placeholder="גודל המרפסת או החצר, כמה אנשים יושבים, סגנון שאהבתם, לוח זמנים — כל פרט עוזר לנו להתאים."
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "contact-message-error" : undefined}
                    className={cn(fieldClass(!!errors.message), "py-4 leading-relaxed resize-none")}
                  />
                  {errors.message && <FieldError id="contact-message-error" message={errors.message} />}
                </div>
              </div>

              {/* The closing bar. A hairline turns the last stretch of the form
                  into its own footer, so the send button reads as an act rather
                  than as one more field, and the privacy line sits with the
                  action it actually describes. */}
              <div className="mt-7 border-t border-border pt-7 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  // min-w holds the width across the label swap, so the row
                  // does not jump the moment you press send.
                  className="group inline-flex h-14 w-full sm:w-auto sm:min-w-[15rem] items-center justify-center gap-3 rounded-[10px] bg-accent px-10 text-lede font-medium text-accent-foreground shadow-accent transition-all duration-300 hover:bg-accent/90 hover:-translate-y-0.5 hover:shadow-luxury disabled:cursor-not-allowed disabled:opacity-60 disabled:translate-y-0"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      שולחים…
                    </>
                  ) : (
                    <>
                      שליחת ההודעה
                      <ArrowLeft
                        className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>

                <p className="text-meta leading-relaxed text-muted-foreground sm:max-w-[22rem]">
                  בשליחת הטופס הינכם מאשרים את{" "}
                  {/* Sand again: charcoal ink, and a standing underline rather
                      than the hover-grown one, because this is a link buried
                      inside a sentence — colour alone can't carry it. */}
                  <Link
                    to="/privacy"
                    className="font-medium text-foreground underline underline-offset-4 decoration-foreground/40 transition-colors hover:decoration-foreground"
                  >
                    מדיניות הפרטיות
                  </Link>{" "}
                  שלנו. הפרטים נשמרים לצורך חזרה אליכם בלבד ולא מועברים לצד שלישי.
                </p>
              </div>

              {/* Announced on submit; the button label alone is not enough for
                  screen readers that keep focus inside the form. */}
              <p className="sr-only" role="status" aria-live="polite">
                {submitting ? "שולחים את ההודעה, רגע אחד" : ""}
              </p>
            </form>
          </Reveal>

          {/* ===== DIRECT CHANNELS =====
              Pinned beside the long form, and set at the same 30px as "כתבו
              לנו" so the two column heads read as peers. Deliberately no
              running text under the rule: the stack has to clear the header
              (top-28) AND still fit a short laptop viewport, or the bottom tile
              becomes unreachable for as long as the column is stuck. */}
          <Reveal delay={120} className="order-1 lg:order-2 min-w-0 lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto rail-scroll">
            <SectionHeading align="start" tone="charcoal">
              מעדיפים לדבר ישירות?
            </SectionHeading>
            <div className="w-20 h-[2px] bg-primary/55 mt-5" aria-hidden="true" />

            <div className="mt-7 flex flex-col gap-4">
              {channels.map((c) => (
                <ChannelTile key={c.key} channel={c} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;
