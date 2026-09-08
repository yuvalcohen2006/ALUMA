import { FormEvent, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useSiteText } from "@/hooks/useSiteText";
import clubBg from "@/assets/categories/club-morning.jpg";

/** Same shape the contact form's schema accepts, kept deliberately loose:
 *  this only has to stop a typo, not adjudicate RFC 5322. */
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const INVALID_EMAIL = "כתובת המייל לא נראית תקינה";

/**
 * Club signup, styled as the ninth tile.
 *
 * Same anatomy as the category tiles above it: full bleed, fixed height,
 * photograph with a clean upper-middle, type top-centred at the same scale,
 * separated from the mosaic by the same 12px seam. The photograph was
 * generated with the whole upper two thirds empty, because unlike a category
 * tile this one needs room for a form as well as a headline.
 *
 * The signup is a field and a labelled button side by side over the sky.
 */
const Newsletter = () => {
  const { t } = useTranslation("home");
  // Editable in the admin, but only in Hebrew — /en keeps its translation.
  const text = useSiteText();
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(
    typeof window !== "undefined" && localStorage.getItem("aluma_newsletter") === "1",
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    /*
     * Validated here, because nothing else validates it.
     *
     * noValidate switches off the browser's own type="email" and required
     * checks — deliberately, so the styling stays ours — and the table has no
     * format constraint. So "asdf" was accepted, stored, and answered with
     * "thank you". Worse, the success state latches in localStorage, so the
     * form never came back and the person could not correct their own typo.
     * The owner ended up with a list seeded with addresses nothing can be
     * sent to.
     */
    const address = email.trim().toLowerCase();
    if (!isEmail(address)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: address, name: null });

      // 23505 = unique violation = already subscribed; treat that as success.
      if (error && error.code !== "23505") {
        toast.error(t("club.error"));
        return;
      }

      try {
        localStorage.setItem("aluma_newsletter", "1");
      } catch {
        // ignore storage failures
      }
      setSubscribed(true);
    } catch {
      toast.error(t("club.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Full bleed, and no frame. The p-3 that used to be here dated from a
    // mosaic of inset tiles that no longer exists, and it was doing two
    // visible jobs by accident: holding the band 12px short of the viewport
    // edges, and painting a 12px strip of page colour between the band and
    // the footer. Nothing separates them now, which is the point — the
    // photograph runs edge to edge and hands straight over to the charcoal.
    <section>
      <div className="relative h-[500px] overflow-hidden md:h-[490px] lg:h-[580px]">
        <img
          src={clubBg}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Same treatment as a morning category tile. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1/2"
          style={{
            background:
"linear-gradient(to bottom, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.25) 55%, transparent 100%)",
          }}
        />

        <div className="relative z-10 text-center text-foreground px-6 pt-[42px] lg:pt-[52px]">
          {/* Title tracks the category tiles so the stack reads as one system.
              The line under it stays at the smaller size, unlike a category
              tagline — here it's helper text introducing a form, not the
              second half of a headline. */}
          <h2 className="font-display font-medium text-display">
            {text("club.title", t("club.title"))}
          </h2>
          <p className="mt-1 text-body text-foreground-soft">
            {text("club.subtitle", t("club.subtitle"))}
          </p>

          {subscribed ? (
            <div
              className="mt-8 inline-flex items-center gap-2 text-body"
              role="status"
              aria-live="polite"
            >
              <Check className="w-5 h-5 text-primary" aria-hidden="true" />
              {t("club.thanks")}
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mx-auto mt-8 w-full max-w-[520px]" noValidate>
              <label className="sr-only" htmlFor="club-email">
                {t("club.emailPlaceholder")}
              </label>

              {/* Field and button side by side, both full height, rather than a
                  button crammed inside the field. The arrow-in-a-circle read as
                  decoration; a labelled button reads as the thing you press.
                  17px on the input because iOS Safari zooms the page on focus
                  below 16px and never zooms back. */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="club-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (invalid) setInvalid(false);
                  }}
                  aria-invalid={invalid || undefined}
                  aria-describedby={invalid ? "club-email-error" : undefined}
                  placeholder={t("club.emailPlaceholder")}
                  autoComplete="email"
                  // Not dir="auto": that reads the direction off the VALUE,
                  // and an empty field has no strong character, so it falls
                  // back to LTR and parks the Hebrew placeholder against the
                  // left edge of a right-to-left page. Decide it here instead
                  // — Hebrew prompt while empty, Latin address once typed.
                  dir={email ? "ltr" : "rtl"}
                  className="h-14 flex-1 min-w-0 rounded-full border border-foreground/15 bg-white/80 px-6 text-small text-foreground text-start shadow-soft backdrop-blur-md transition-colors placeholder:text-foreground/70 focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-14 shrink-0 rounded-full bg-foreground px-8 text-small font-medium text-background transition-colors duration-200 hover:bg-accent disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {t("club.submit")}
                </button>
              </div>

              {invalid && (
                <p
                  id="club-email-error"
                  role="alert"
                  className="mt-3 text-label font-medium text-destructive"
                >
                  {INVALID_EMAIL}
                </p>
              )}

              {/* foreground-soft at full opacity, not charcoal at 55%. This
                  line sits about 87% down the white scrim, where the wash is
                  roughly 7% — effectively on the raw photograph — and measured
                  3.09:1 there. The token gives 5.4:1 on the same pixels. */}
              <p className="mt-3 text-label text-foreground-soft">
                {t("club.unsubscribe")}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
