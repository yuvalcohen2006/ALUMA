import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Check,
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
    line: "מענה תוך 24 שעות בימי עסקים",
    href: `mailto:${SITE.email}`,
  },
  {
    key: "showroom",
    Icon: MapPin,
    iconClass: "bg-primary/10 text-accent",
    title: `אולם התצוגה ב${SITE.address.city}`,
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
  "group flex w-full items-center gap-4 rounded-[14px] border border-border bg-background p-5 text-right shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-luxury";

const ChannelTile = ({ channel }: { channel: Channel }) => {
  const { Icon } = channel;

  const inner = (
    <>
      <span
        className={cn(
          "shrink-0 w-12 h-12 rounded-[10px] flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.06]",
          channel.iconClass,
        )}
      >
        <Icon className="w-6 h-6" />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block font-display font-normal text-[22px] leading-snug text-foreground",
            // A latin string inside an RTL block: flip the element to LTR so the
            // digits read correctly, then pin it back to the right edge.
            channel.ltr && "text-right",
          )}
          dir={channel.ltr ? "ltr" : undefined}
        >
          {channel.title}
        </span>
        <span className="block text-[18px] leading-snug text-muted-foreground mt-1.5">
          {channel.line}
        </span>
      </span>

      {/* RTL: forward points left */}
      <ChevronLeft
        className="w-5 h-5 shrink-0 text-primary/60 transition-transform duration-300 group-hover:-translate-x-1"
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

// Tall, generously padded fields. Deliberately no `outline-none`: the global
// focus-visible ring in index.css is what keyboard users navigate by.
const fieldClass = (invalid: boolean) =>
  cn(
    "w-full rounded-[14px] border bg-background px-4 text-[18px] text-foreground text-right",
    "placeholder:text-muted-foreground/70 transition-smooth focus:ring-4 focus:ring-primary/15",
    invalid ? "border-destructive/70 focus:border-destructive" : "border-border focus:border-primary",
  );

const labelClass = "block font-display text-[18px] font-medium text-foreground mb-2.5";

const FieldError = ({ id, message }: { id: string; message: string }) => (
  <p id={id} className="mt-2 flex items-start gap-2 text-[18px] leading-snug text-destructive">
    <AlertCircle className="w-4 h-4 mt-1.5 shrink-0" aria-hidden="true" />
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
    <section id="contact" dir="rtl" className="py-16 md:py-24 bg-secondary">
      <div className="container-luxury">
        {/* The split: the form takes the wider right column (first child in RTL),
            the direct channels ride alongside it on the left and stay put while
            the form scrolls. */}
        <div className="grid gap-12 lg:gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start max-w-6xl mx-auto">
          {/* ===== FORM ===== */}
          <Reveal className="order-1 min-w-0">
            <SectionHeading
              align="start"
              tone="charcoal"
              subtitle="ספרו לנו מה החלום שלכם ואנחנו נדאג להגשים לכם אותו."
            >
              כתבו לנו
            </SectionHeading>

            <ul className="mt-6 flex flex-col gap-2.5 text-[18px] text-foreground-soft">
              {assurances.map((a) => (
                <li key={a} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden="true" />
                  {a}
                </li>
              ))}
            </ul>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
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
                  className="rounded-[14px] border border-destructive/40 bg-destructive/5 p-5 text-right"
                >
                  <p className="flex items-center gap-2.5 text-[18px] font-medium text-destructive">
                    <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                    לא הצלחנו לשלוח, יש לתקן את השדות המסומנים
                  </p>
                  <ul className="mt-3 space-y-1.5 text-[18px] leading-snug text-destructive/90">
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
                  <label htmlFor="contact-name" className={labelClass}>
                    שם מלא <span className="text-accent">*</span>
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
                    טלפון <span className="text-accent">*</span>
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
                  className={cn(fieldClass(!!errors.message), "min-h-[170px] py-4 leading-relaxed resize-none")}
                />
                {errors.message && <FieldError id="contact-message-error" message={errors.message} />}
              </div>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="group inline-flex h-14 w-full sm:w-auto items-center justify-center gap-3 rounded-[14px] bg-accent px-10 text-[20px] font-medium text-accent-foreground shadow-accent transition-all duration-300 hover:bg-accent/90 hover:-translate-y-0.5 hover:shadow-luxury disabled:cursor-not-allowed disabled:opacity-60 disabled:translate-y-0"
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

                <p className="text-[18px] leading-snug text-muted-foreground sm:max-w-[15rem]">
                  השדות המסומנים ב־<span className="text-accent">*</span> הם שדות חובה
                </p>
              </div>

              {/* Announced on submit; the button label alone is not enough for
                  screen readers that keep focus inside the form. */}
              <p className="sr-only" role="status" aria-live="polite">
                {submitting ? "שולחים את ההודעה, רגע אחד" : ""}
              </p>

              <p className="text-[18px] leading-relaxed text-muted-foreground">
                בשליחת הטופס הינכם מאשרים את{" "}
                <Link to="/privacy" className="link-underline text-accent">
                  מדיניות הפרטיות
                </Link>{" "}
                שלנו. הפרטים נשמרים לצורך חזרה אליכם בלבד ולא מועברים לצד שלישי.
              </p>
            </form>
          </Reveal>

          {/* ===== DIRECT CHANNELS =====
              Pinned beside the long form. It carries a bare title + divider
              rather than a SectionHeading with running text on purpose: the
              stack has to clear the header (top-28) AND still fit a 768px-tall
              laptop viewport, or the bottom tile becomes unreachable for as
              long as the column is stuck. */}
          <Reveal delay={120} className="order-2 min-w-0 lg:sticky lg:top-28">
            <h2 className="font-display font-bold text-[26px] leading-snug text-foreground text-right">
              מעדיפים לדבר ישירות?
            </h2>
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
