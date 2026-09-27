import { useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Check, ChevronDown, Loader2 } from "lucide-react";
import {
  IconBrandGmail,
  IconBrandWaze,
  IconBrandWhatsapp,
  IconPhone,
  type Icon as TablerIcon,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { contactSchema } from "@/lib/contactSchema";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContact } from "@/hooks/useSiteContact";
import { gmailComposeLink } from "@/lib/webmail";
import { mapLinkTarget, mapLinks } from "@/lib/maps";
import { submitErrorMessage } from "@/lib/submitError";
import { latinFieldProps } from "@/lib/field-direction";
import type { SiteContact } from "@/lib/site-contact";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import DirectionalArrow from "@/components/DirectionalArrow";
import ShineButton from "@/components/ui/shine-button";

/* ---------------------------------------------------------------------------
   Direct channels — four short cards, each one link, each leaving the page:
   WhatsApp, a phone call, Gmail, and Waze to the showroom.
--------------------------------------------------------------------------- */

type Channel = {
  key: string;
  Icon: TablerIcon;
  /** What the card does, in words. */
  label: ReactNode;
  /** The number, the address, the place — isolated, since two are Latin. */
  detail?: string;
  href: string;
  /** Anything but the phone call opens in a new tab on a computer. */
  newTab?: boolean;
};

type TFunc = (key: string, opts?: Record<string, unknown>) => string;

const channelsFor = (SITE: SiteContact, t: TFunc): Channel[] => {
  const { waze } = mapLinks(SITE.address.street, SITE.address.city);
  return [
    {
      key: "whatsapp",
      Icon: IconBrandWhatsapp,
      label: t("channels.whatsapp"),
      href: SITE.whatsapp.link(t("channels.whatsappMessage")),
      newTab: true,
    },
    {
      key: "phone",
      Icon: IconPhone,
      label: t("channels.phone"),
      detail: SITE.phone.display,
      href: `tel:${SITE.phone.tel}`,
    },
    {
      key: "email",
      Icon: IconBrandGmail,
      label: t("channels.email"),
      detail: SITE.email,
      /* Straight to Gmail, composing to the studio.
         It was a mailto: with a choice of three routes under it. A mailto:
         is handed to whatever mail program the computer has registered, and
         for most people who live in Gmail in a browser that is nothing at all
         — Chrome and Edge ignore the click without a word. The owner asked
         for one link that lands in Gmail, and this is that link. */
      href: gmailComposeLink(SITE.email, t("email.subject")),
      newTab: true,
    },
    {
      key: "waze",
      Icon: IconBrandWaze,
      label: t("channels.showroomTitle", { city: SITE.address.city }),
      detail: t("channels.showroomLine", { street: SITE.address.street }),
      href: waze,
    },
  ];
};

/* The email prefill, the tile actions and the form copy all live in the
   `contact` namespace. They were module constants in Hebrew, which meant
   /en/faq rendered an English heading over an entirely Hebrew contact block —
   the one place on the English site where a visitor is asked to act. */

/**
 * One card: a line icon in terracotta, what it does, and the detail under it.
 *
 * The cards were tall panels with a tinted chip behind the icon, a sentence of
 * description, a chevron, and — on the email one — three links of their own.
 * Each is now one short row, and the whole row is the link.
 *
 * The fill is a step lighter than the grey band they sit on, so each reads as
 * a card rather than as a bordered patch of the same grey.
 */
const ChannelTile = ({ channel }: { channel: Channel }) => {
  const { Icon } = channel;
  // Waze decides per device: a phone follows it in the same tab, which is
  // what hands it to the app. Everything else that leaves opens in a new tab.
  const target =
    channel.key === "waze"
      ? mapLinkTarget()
      : channel.newTab
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {};

  return (
    <a
      href={channel.href}
      {...target}
      className="group flex h-full min-h-[5.25rem] items-center gap-4 rounded-sm border border-border bg-[hsl(0_0%_97%)] px-5 py-4 text-start transition-colors duration-200 hover:border-foreground/25 hover:bg-background"
    >
      <Icon
        aria-hidden="true"
        stroke={1.5}
        className="h-7 w-7 shrink-0 text-accent transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none"
      />
      <span className="min-w-0">
        <span className="block text-body leading-snug text-foreground">{channel.label}</span>
        {channel.detail && (
          <span className="mt-0.5 block text-small leading-snug text-muted-foreground">
            <bdi>{channel.detail}</bdi>
          </span>
        )}
      </span>
    </a>
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
    // The #contact anchor lives here now, on the grey band itself: product
    // pages, the header and the footer all link to /faq#contact, and "כתבו
    // לנו" belongs with the ways of writing rather than floating above them.
    <section id="contact" className="scroll-mt-28 py-14 md:py-20 bg-secondary border-y border-border">
      <div className="container-luxury">
        {/* Channels before the form, everywhere. Apple's own contact page has
            no form at all — a person deciding on made-to-order furniture wants
            a phone number and a showroom before a message box.
            Full container width, so "כתבו לנו" starts on the same edge as the
            page title and the questions above it. */}
        <div>
          <Reveal className="min-w-0">
            <h2 className="mb-8 text-start text-heading font-normal tracking-normal text-foreground md:mb-10">
              {t("writeToUs")}
            </h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 mb-16 md:mb-20">
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
            <ShineButton
              onClick={() => setFormOpen((v) => !v)}
              aria-expanded={formOpen}
              aria-controls="contact-form-region"
              className="mt-9"
            >
              {formOpen ? t("closeForm") : t("openForm")}
              <ChevronDown
                className={cn("transition-transform duration-300", formOpen && "rotate-180")}
                aria-hidden="true"
              />
            </ShineButton>

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
                <ShineButton
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  // min-w holds the width across the label swap, so the row
                  // does not jump the moment you press send.
                  className="w-full sm:w-auto sm:min-w-[13rem]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden="true" />
                      {t("submitting")}
                    </>
                  ) : (
                    <>
                      {t("submit")}
                      <DirectionalArrow animate={false} />
                    </>
                  )}
                </ShineButton>

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
