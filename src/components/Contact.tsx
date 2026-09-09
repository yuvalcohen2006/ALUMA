import { useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
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
import { useSiteContact } from "@/hooks/useSiteContact";
import { mailtoLink } from "@/lib/mailto";
import { copyText, gmailComposeLink } from "@/lib/webmail";
import { submitErrorMessage } from "@/lib/submitError";
import { latinFieldProps } from "@/lib/field-direction";
import type { SiteContact } from "@/lib/site-contact";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import DirectionalArrow from "@/components/DirectionalArrow";

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

type TFunc = (key: string, opts?: Record<string, unknown>) => string;

const channelsFor = (SITE: SiteContact, t: TFunc): Channel[] => [
  {
    key: "whatsapp",
    Icon: WhatsAppIcon,
    iconClass: "bg-[#25D366]/10 text-[#25D366]",
    glyphClass: "w-[22px] h-[22px]",
    title: t("channels.whatsapp.title"),
    line: t("channels.whatsapp.line"),
    href: SITE.whatsapp.link(t("channels.whatsappMessage")),
    external: true,
  },
  {
    key: "phone",
    Icon: Phone,
    iconClass: "bg-foreground/15 text-accent",
    title: SITE.phone.display,
    ltr: true,
    line: t("channels.phoneLine"),
    href: `tel:${SITE.phone.tel}`,
  },
  {
    key: "email",
    Icon: Mail,
    iconClass: "bg-foreground/15 text-accent",
    title: SITE.email,
    ltr: true,
    // Deliberately not the 24-hour promise: that line already sits, word for
    // word, in the assurances beside the form — two identical sentences a few
    // centimetres apart read as a copy-paste slip.
    line: t("channels.emailLine"),
    // Prefilled, like the WhatsApp tile beside it. A bare mailto: opens an
    // empty window, and the visitor has to invent an opening line.
    href: mailtoLink(SITE.email, t("email.subject"), t("email.body")),
  },
  {
    key: "showroom",
    Icon: MapPin,
    iconClass: "bg-foreground/15 text-accent",
    title: t("channels.showroomTitle", { city: SITE.address.city }),
    // The street stays on the tile. This is the one channel whose whole subject
    // is "where", and a visitor scanning the four tiles should get the answer
    // without a click — the band a screen below is the detail, not the source.
    line: t("channels.showroomLine", { street: SITE.address.street }),
  },
];

/* The email prefill, the tile actions and the form copy all live in the
   `contact` namespace now. They were module constants in Hebrew, which meant
   /en/faq rendered an English heading over an entirely Hebrew contact block —
   the one place on the English site where a visitor is asked to act. */

const scrollToShowroom = () => {
  const el = document.getElementById("showroom");
  if (!el) return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" });
};

const tileClass =
"group flex h-full w-full flex-col items-start gap-4 rounded-sm border border-border bg-secondary p-6 md:p-7 text-start transition-colors duration-200 hover:border-foreground/20 hover:bg-background";

const ChannelTile = ({ channel }: { channel: Channel }) => {
  const { Icon } = channel;
  // The showroom tile is the only one that stays on the page. Its cue points
  // down, where it actually goes, instead of promising a departure it never
  // makes — same weight, same slot, so the four tiles still read as a set.
  const jumps = !channel.href;
  const Cue = jumps ? ChevronDown : ChevronLeft;
  // The email tile offers three routes rather than making one; a cue pointing
  // out of the page would promise a departure it does not make.
  const showCue = channel.key !== "email";

  const inner = (
    <>
      <span
        className={cn(
"shrink-0 w-12 h-12 rounded-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.06]",
          channel.iconClass,
        )}
      >
        <Icon className={channel.glyphClass ?? "w-6 h-6"} />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
"block font-display font-normal text-body leading-snug text-foreground",
            // A Latin string inside an RTL block: flip the element to LTR so
            // the digits read in order, then pin it back to the block's own
            // reading edge. `text-start` cannot do that — it resolves against
            // this element's direction, which is now ltr, which is the LEFT
            // edge and the opposite of every other line on the tile.
            channel.ltr && "text-end rtl:text-start",
          )}
          dir={channel.ltr ? "ltr" : undefined}
        >
          {channel.title}
        </span>
        <span className="block text-body leading-snug text-muted-foreground mt-1.5">
          {channel.line}
        </span>
      </span>

      {/* RTL: forward points left */}
      {showCue && <Cue
        className={cn(
"w-5 h-5 shrink-0 text-accent transition-all duration-300 group-hover:text-primary",
          jumps ? "group-hover:translate-y-0.5" : "group-hover:-translate-x-1",
        )}
        aria-hidden="true"
      />}
    </>
  );

  if (channel.key === "email")
    return <EmailTile inner={inner} email={channel.title} mailto={channel.href!} />;

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

/**
 * The email tile, which is the only one that cannot be a single link.
 *
 * A mailto: is correct and, for a large share of visitors, does nothing at all.
 * The browser hands the URL to a registered protocol handler; with none
 * registered, Chrome and Edge silently ignore the click — no error, no tab, not
 * even a console message — and a page is not permitted to detect that, because
 * the handler list is withheld on privacy grounds. The person signed into Gmail
 * in a browser tab is exactly the person it fails for, which is the report that
 * produced this component.
 *
 * So it offers three routes and detects nothing. The address is a mailto for
 * anyone with a mail client, the Gmail link opens a composed message in a tab,
 * and copy is the floor that always works. Offering the choice is also why this
 * tile stops being one big link: an anchor cannot legally contain another
 * anchor and a button.
 */
const EmailTile = ({
  inner,
  email,
  mailto,
}: {
  inner: ReactNode;
  email: string;
  mailto: string;
}) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation("contact");

  const copy = async () => {
    const ok = await copyText(email);
    if (!ok) return toast.error(t("email.copyFailed"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div className={cn(tileClass, "cursor-default")}>
      {inner}

      <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2">
        <a
          href={mailto}
          className="text-body text-accent underline decoration-1 underline-offset-4 transition-colors hover:text-foreground"
        >
          {t("email.openInMailApp")}
        </a>
        <a
          href={gmailComposeLink(email, t("email.subject"), t("email.body"))}
          target="_blank"
          rel="noopener noreferrer"
          className="text-body text-accent underline decoration-1 underline-offset-4 transition-colors hover:text-foreground"
        >
          {t("email.openInGmail")}
        </a>
        <button
          type="button"
          onClick={copy}
          className="text-body text-accent underline decoration-1 underline-offset-4 transition-colors hover:text-foreground"
        >
          {t("email.copyAddress")}
        </button>
        {/* Polite, never assertive: a copy confirmation must not interrupt
            whatever was already being read aloud. */}
        <span role="status" aria-live="polite" className="text-body text-muted-foreground">
          {copied ? t("email.copied") : ""}
        </span>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------
   The form
--------------------------------------------------------------------------- */


// Tall, generously padded fields. Radius is the site's control radius (10px,
// the same tablet the buttons and pills use) rather than the 14px reserved for
// cards and panels. Deliberately no `outline-none`: the global focus-visible
// ring in index.css is what keyboard users navigate by.
// Underline fields, not boxes. The border is the single line under the text;
// focus deepens it to the accent. Radius/background/padding all gone — a boxed
// grey input is the support-ticket tell this page is escaping.
const fieldClass = (invalid: boolean) =>
  cn(
"w-full rounded-none border-0 border-b bg-transparent px-0 text-body text-foreground text-start",
"placeholder:text-muted-foreground/85 transition-colors focus:ring-0",
    invalid ? "border-destructive/70 focus:border-destructive" : "border-input focus:border-accent",
  );

const labelClass = "block text-label tracking-[0.04em] text-foreground-soft mb-1.5";

const FieldError = ({ id, message }: { id: string; message: string }) => (
  <p id={id} className="mt-2.5 flex items-start gap-2.5 text-body leading-snug text-destructive">
    {/* 18px at leading-snug is a ~25px line box; a 18px glyph centres on it at
        3px, not at the 6px a plain spacing step would give. */}
    <AlertCircle className="w-[18px] h-[18px] mt-[3px] shrink-0" aria-hidden="true" />
    {message}
  </p>
);

const COOLDOWN_MS = 30_000;
const MIN_FILL_MS = 2_500;


const Contact = () => {
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation("contact");
  const { to } = useLocalizedPath();
  const assurances = t("assurances", { returnObjects: true }) as string[];
  // Phone, address and social links as set in /admin/settings, over the ones
  // the site ships with.
  const channels = channelsFor(useSiteContact(), t);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const formMountedAt = useRef<number>(Date.now());
  const lastSubmitAt = useRef<number>(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const now = Date.now();

    if (now - formMountedAt.current < MIN_FILL_MS) {
      toast.error(t("toast.tooFast"));
      return;
    }
    if (now - lastSubmitAt.current < COOLDOWN_MS) {
      const secs = Math.ceil((COOLDOWN_MS - (now - lastSubmitAt.current)) / 1000);
      toast.error(t("toast.cooldown", { secs }));
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
      toast.success(t("toast.thanks"));
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
      toast.error(t("toast.fixFields"));
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
        // Nothing was sent, so nothing should be held against the next
        // attempt. The cooldown exists to stop a flood of real submissions;
        // charging it for a failed one meant the toast said "try again in a
        // moment" and the next press answered "a message was sent recently,
        // try again in 27 seconds" — about a message that never left.
        lastSubmitAt.current = 0;
        const ctx = (error as { context?: Response }).context;
        toast.error(await submitErrorMessage(ctx));
      } else if (result?.ok) {
        form.reset();
        formMountedAt.current = Date.now();
        navigate(to("/thank-you"));
      } else {
        lastSubmitAt.current = 0;
        toast.error(t("toast.unexpected"));
      }
    } catch (err) {
      console.error(err);
      lastSubmitAt.current = 0;
      toast.error(t("toast.network"));
    } finally {
      setSubmitting(false);
    }
  };

  const errorList = Object.entries(errors);

  return (
    // A tinted band, and now a ruled one. Fill alone carried every seam on this
    // site while the page was cream and the band sand (1.22:1). White against
    // #F8F8F8 is 1.06:1 — too little to mark a section change by itself.
    <section className="py-14 md:py-20 bg-secondary border-y border-border">
      <div className="container-luxury">
        {/* Channels before the form, everywhere. Apple's own contact page has
            no form at all — a person deciding on made-to-order furniture wants
            a phone number and a showroom before a message box. */}
        <div className="max-w-6xl mx-auto">
          <Reveal className="min-w-0">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-16 md:mb-20">
              {channels.map((c) => (
                <ChannelTile key={c.key} channel={c} />
              ))}
            </div>
          </Reveal>

          {/* ===== FORM ===== */}
          <Reveal className="min-w-0 max-w-[640px]">
            <p className="text-body leading-relaxed text-foreground-soft">
              {t("intro")}
            </p>

            {/* Close to the heading (24px) because it belongs to it, and a full
                36px clear of the form below — related things near, the change
                of gear far. */}
            <ul className="mt-6 flex flex-col gap-3 text-body text-foreground-soft">
              {assurances.map((a) => (
                <li key={a} className="flex items-center gap-3">
                  {/* Deeper terracotta, not primary. Re-measured on the white
                      palette: primary reaches 3.1:1 on this band and accent
                      4.0:1. Primary now scrapes the 3:1 glyph floor it used to
                      fail; accent is the one with room to spare. */}
                  <Check
                    className="w-[18px] h-[18px] shrink-0 text-accent"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  {a}
                </li>
              ))}
            </ul>

            {/*
              A disclosure, not a dialog — so a real <button> with
              aria-expanded and aria-controls, per the APG pattern, and
              deliberately NO focus move when it opens. Moving focus into the
              first field would mean someone who pressed this by accident
              cannot simply press it again to close it.

              Same grid-template-rows 0fr -> 1fr mechanism the FAQ answers on
              this page already use, so there is one way of opening things here
              rather than two.

              Honest note: collapsing a form is conversion-NEUTRAL in the only
              real usability data on it (Baymard, on accordion checkouts). What
              it reliably does is split one funnel into two — fewer people see
              the fields, more of those who do finish. Worth watching in the
              leads table rather than assuming.
            */}
            <button
              type="button"
              onClick={() => setFormOpen((v) => !v)}
              aria-expanded={formOpen}
              aria-controls="contact-form-region"
              className="mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-small font-medium text-background transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {formOpen ? t("closeForm") : t("openForm")}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  formOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>

            <div
              id="contact-form-region"
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-in-out",
                formOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              {/*
                min-h-0 is what lets the 0fr row actually collapse; without it
                the child's min-content height holds the row open.

                `inert` while closed is not optional. A 0fr grid row with
                overflow hidden makes the form invisible and leaves every field
                focusable and submittable — so a keyboard user tabs off the
                button straight into a form they cannot see, and a screen reader
                reads out fields that are not there. inert removes the whole
                subtree from the tab order and the accessibility tree at once.

                Spread rather than written as a prop: React 18 does not know
                `inert` and warns when given a boolean, so it is passed as the
                empty-string attribute the HTML spec actually defines.
              */}
              <div
                className="min-h-0 overflow-hidden"
                {...(formOpen ? {} : { inert: "" })}
              >
                {/* The card. A form on a page needs an edge to read as a form
                    rather than as more page — a bordered panel on the white
                    ground, with room inside it. */}
                <div className="mt-6 rounded-sm border border-border bg-background p-6 md:p-8">
            <form onSubmit={handleSubmit} noValidate>
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
                  className="mb-7 rounded-sm border border-destructive/40 bg-destructive/5 p-5 text-start"
                >
                  <p className="flex items-center gap-2.5 text-body font-medium text-destructive">
                    <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                    {t("errorSummary")}
                  </p>
                  <ul className="mt-3 space-y-1.5 text-body leading-snug text-destructive">
                    {errorList.map(([key, message]) => (
                      <li key={key}>
                        {t(`fields.${key}`, { defaultValue: key })}: {message}
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
                    on the tinted band, where text-accent measures 4.0:1 — still under
                    AA for 18px. The ink stays charcoal and the terracotta stays
                    in the rules, exactly as the projects index does it. */}
                <p className="text-body leading-snug text-muted-foreground">{t("required")}</p>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className={labelClass}>
                      {t("fields.nameLabel")}
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      required
                      maxLength={100}
                      autoComplete="name"
                      placeholder={t("fields.namePlaceholder")}
                      dir="rtl"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                      className={cn(fieldClass(!!errors.name), "h-14")}
                    />
                    {errors.name && <FieldError id="contact-name-error" message={errors.name} />}
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className={labelClass}>
                      {t("fields.phoneLabel")}
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      required
                      type="tel"
                      maxLength={20}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder={t("fields.phonePlaceholder")}
                      // Hebrew prompt while empty, digits left-to-right once
                      // typed. See lib/field-direction.
                      {...latinFieldProps}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                      className={cn(fieldClass(!!errors.phone), "h-14")}
                    />
                    {errors.phone && <FieldError id="contact-phone-error" message={errors.phone} />}
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-email" className={labelClass}>
                    {t("fields.emailLabel")}{" "}
                    <span className="font-normal text-muted-foreground">{t("fields.emailOptional")}</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    maxLength={255}
                    autoComplete="email"
                    placeholder={t("fields.emailPlaceholder")}
                    {...latinFieldProps}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                    className={cn(fieldClass(!!errors.email), "h-14")}
                  />
                  {errors.email && <FieldError id="contact-email-error" message={errors.email} />}
                </div>

                <div>
                  <label htmlFor="contact-message" className={labelClass}>
                    {t("fields.messageLabel")}{" "}
                    <span className="font-normal text-muted-foreground">{t("fields.emailOptional")}</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    maxLength={1000}
                    rows={7}
                    dir="auto"
                    placeholder={t("fields.messagePlaceholder")}
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
                  className="group inline-flex h-14 w-full sm:w-auto sm:min-w-[13rem] items-center justify-center gap-3 rounded-full bg-foreground px-10 text-body font-medium text-background transition-colors duration-300 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      {t("submitting")}
                    </>
                  ) : (
                    <>
                      {t("submit")}
                      <DirectionalArrow className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-body leading-relaxed text-muted-foreground sm:max-w-[22rem]">
                  {t("consent.before")}{" "}
                  {/* Sand again: charcoal ink, and a standing underline rather
                      than the hover-grown one, because this is a link buried
                      inside a sentence — colour alone can't carry it. */}
                  <Link
                    to={to("/privacy")}
                    className="font-medium text-foreground underline underline-offset-4 decoration-foreground/40 transition-colors hover:decoration-foreground"
                  >
                    {t("consent.policy")}
                  </Link>{" "}
                  {t("consent.after")}
                </p>
              </div>

              {/* Announced on submit; the button label alone is not enough for
                  screen readers that keep focus inside the form. */}
              <p className="sr-only" role="status" aria-live="polite">
                {submitting ? t("submittingLive") : ""}
              </p>
            </form>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
};

export default Contact;
