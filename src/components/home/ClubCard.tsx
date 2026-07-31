import { FormEvent, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";

/**
 * Club / newsletter signup.
 *
 * The field is an underline, not a boxed input with a filled pill beside it —
 * that combination is the default shop-template look and is what cheapens an
 * otherwise restrained page. One field only: asking for a first name as well
 * roughly halves completion and buys a greeting nobody reads.
 *
 * 17px on the input is not arbitrary. iOS Safari zooms the whole page when a
 * focused field is under 16px, and the zoom does not undo itself on blur.
 */
const ClubCard = () => {
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
    <section className="section-pad bg-secondary">
      <div className="container-luxury">
        <Reveal>
          <div className="mx-auto max-w-[520px] text-center">
            <SectionHeading
              tone="charcoal"
              align="center"
              subtitle="הצצה לקולקציות חדשות לפני כולם, וטיפים לעיצוב מרפסות וגינות — ישירות לתיבה."
            >
              הצטרפו למועדון
            </SectionHeading>

            {subscribed ? (
              <div
                className="mt-2 inline-flex items-center gap-2 text-[17px] text-foreground"
                role="status"
                aria-live="polite"
              >
                <Check className="w-5 h-5 text-primary" aria-hidden="true" />
                תודה — נתראה בתיבה.
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-2" noValidate>
                <label className="sr-only" htmlFor="club-email">
                  כתובת אימייל
                </label>
                <div className="relative border-b border-foreground/30 focus-within:border-foreground transition-colors">
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
                    className="w-full h-12 bg-transparent text-[17px] text-foreground text-start pe-12 outline-none placeholder:text-foreground/45"
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
                <p className="mt-3 text-[12px] text-foreground/50">
                  אפשר להסיר את ההרשמה בכל רגע.
                </p>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ClubCard;
