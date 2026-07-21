import { FormEvent, useState } from "react";
import { Mail, Check } from "lucide-react";
import { toast } from "sonner";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import { supabase } from "@/integrations/supabase/client";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
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
        .insert({ email: email.trim().toLowerCase(), name: name.trim() || null });

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
      toast.success("נרשמת בהצלחה! נשלח אליך השראה ועדכונים על קולקציות חדשות.");
    } catch {
      toast.error("משהו השתבש בהרשמה. נסו שוב מאוחר יותר.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-background border-t border-border/60">
      <div className="container-luxury">
        <Reveal>
          <div className="relative max-w-4xl mx-auto bg-gradient-to-br from-secondary to-secondary/40 rounded-sm overflow-hidden p-8 md:p-14 text-center border border-border/60">
            <SectionLabel
              he="הצטרפו למועדון"
              en="Aluma Insider"
              className="text-xs text-primary mb-4 justify-center"
            />
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-primary leading-tight mb-3">
              השראה לחוץ שלך,
              <span className="italic"> ישירות למייל</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              טיפים לעיצוב מרפסות וגינות, הצצה לקולקציות חדשות לפני כולם,
              ותוכן השראה שבועי ישירות לאינבוקס.
            </p>

            {subscribed ? (
              <div
                className="inline-flex items-center gap-3 px-6 py-4 rounded-sm bg-primary/5 border border-primary/15 text-primary"
                role="status"
                aria-live="polite"
              >
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <div className="font-display text-base md:text-lg leading-tight">
                    תודה שהצטרפת!
                  </div>
                  <div className="text-xs text-muted-foreground">
                    עדכונים ותוכן השראה ישלחו אליך בקרוב
                  </div>
                </div>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
                noValidate
              >
                <label className="sr-only" htmlFor="newsletter-name">שם</label>
                <input
                  id="newsletter-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="שם פרטי"
                  autoComplete="given-name"
                  className="flex-1 px-4 py-3 rounded-sm bg-background border border-border text-primary placeholder:text-muted-foreground/70 focus:border-primary outline-none transition-smooth"
                />
                <label className="sr-only" htmlFor="newsletter-email">אימייל</label>
                <div className="flex-[1.4] relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="כתובת אימייל"
                    autoComplete="email"
                    className="w-full pr-10 pl-4 py-3 rounded-sm bg-background border border-border text-primary placeholder:text-muted-foreground/70 focus:border-primary outline-none transition-smooth"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-accent text-primary-foreground px-6 py-3 rounded-sm tracking-wide font-medium transition-smooth disabled:opacity-60"
                >
                  {submitting ? "שולח…" : "הצטרפות"}
                </button>
              </form>
            )}

            <p className="text-[11px] text-muted-foreground mt-5">
              אנחנו שומרים על הפרטיות שלך. ניתן לבטל הרשמה בכל עת.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Newsletter;
