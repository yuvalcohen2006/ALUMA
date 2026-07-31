import { FormEvent, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
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
 * The input is an underline, not a boxed field with a filled button — that
 * combination is the default shop-template look. 17px matters: iOS Safari
 * zooms the page when a focused field is under 16px, and doesn't zoom back.
 */
const Newsletter = () => {
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
        toast.error("משהו השתבש בהרשמה. נסו שוב או פנו אלינו ישירות.");
        return;
      }

      try {
        localStorage.setItem("aluma_newsletter", "1");
      } catch {
        // ignore storage failures
      }
      setSubscribed(true);
    } catch {
      toast.error("משהו השתבש בהרשמה. נסו שוב מאוחר יותר.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-background pt-3">
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
          <h2 className="font-display font-semibold text-[32px] lg:text-[40px] leading-[1.125] lg:leading-[1.1]">
            הצטרפו למועדון
          </h2>
          <p className="mt-1 text-[19px] lg:text-[21px] leading-[1.21] lg:leading-[1.238] text-foreground-soft">
            קולקציות חדשות לפני כולם, וטיפים לעיצוב החוץ — ישירות לתיבה.
          </p>

          {subscribed ? (
            <div
              className="mt-8 inline-flex items-center gap-2 text-[19px]"
              role="status"
              aria-live="polite"
            >
              <Check className="w-5 h-5 text-primary" aria-hidden="true" />
              תודה — נתראה בתיבה.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-[420px]" noValidate>
              <label className="sr-only" htmlFor="club-email">
                כתובת אימייל
              </label>
              <div className="relative border-b border-foreground/35 focus-within:border-foreground transition-colors">
                <input
                  id="club-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="כתובת אימייל"
                  autoComplete="email"
                  // Email addresses are Latin, so the text runs LTR — but the
                  // field still aligns to the reading edge.
                  dir="ltr"
                  className="w-full h-12 bg-transparent text-[17px] text-foreground text-start pe-12 outline-none placeholder:text-foreground/50"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  aria-label="הצטרפות"
                  className="absolute end-0 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center text-foreground/70 hover:text-accent disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <ArrowLeft className="w-5 h-5 ltr:-scale-x-100" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-3 text-[13px] text-foreground/55">
                אפשר להסיר את ההרשמה בכל רגע.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
