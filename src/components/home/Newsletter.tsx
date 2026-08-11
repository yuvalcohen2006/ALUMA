import { FormEvent, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import clubBg from "@/assets/categories/club-morning.jpg";

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
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(
    typeof window !== "undefined" && localStorage.getItem("aluma_newsletter") === "1",
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim().toLowerCase(), name: null });

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
    // px-3 matches the mosaic above: this is the ninth tile, so it takes the
    // same frame. Flush against the viewport while every tile above it is
    // inset would read as a bug, not a choice.
    <section className="bg-background p-3">
      <div className="relative h-[500px] md:h-[490px] lg:h-[580px] overflow-hidden">
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
          <h2 className="font-display font-semibold text-[36px] lg:text-[48px] leading-[1.1]">
            {t("club.title")}
          </h2>
          <p className="mt-1 text-[19px] lg:text-[21px] leading-[1.21] lg:leading-[1.238] text-foreground-soft">
            {t("club.subtitle")}
          </p>

          {subscribed ? (
            <div
              className="mt-8 inline-flex items-center gap-2 text-[19px]"
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("club.emailPlaceholder")}
                  autoComplete="email"
                  // NO dir override here on purpose. dir="auto" looked right but
                  // does the opposite of what it reads like: on an <input> the
                  // HTML spec resolves auto from the VALUE, not the placeholder,
                  // and an empty value has no strong character, so it falls back
                  // to ltr — which made text-start compute to LEFT and threw the
                  // Hebrew placeholder to the wrong edge.
                  // Inheriting from <html dir> instead is also the only version
                  // that survives the language switch: rtl on /, ltr on /en.
                  // A typed Latin address still reads left-to-right either way,
                  // because its letters are strong-LTR and bidi runs them as one.
                  className="h-14 flex-1 min-w-0 rounded-full border border-foreground/15 bg-white/80 px-6 text-[17px] text-foreground text-start shadow-soft backdrop-blur-md outline-none transition-colors placeholder:text-foreground/45 focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-14 shrink-0 rounded-full bg-foreground px-8 text-[17px] font-medium text-background transition-colors duration-200 hover:bg-accent disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {t("club.submit")}
                </button>
              </div>

              <p className="mt-3 text-[13px] text-foreground/55">
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
