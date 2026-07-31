import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useLocalizedPath } from "@/lib/useLocalizedPath";

/**
 * One quiet line offering the personal-consultation form.
 *
 * Deliberately a band and not a card: the questionnaire is a lead form, and
 * dressing a lead form up as a feature is how it ends up feeling like a
 * pop-up. It states plainly that a person gets back to you, because that is
 * what actually happens — the old version promised an instant recommendation
 * and then named collections that did not exist.
 */
const ConsultCTA = () => {
  const { to } = useLocalizedPath();

  return (
    <section className="bg-background border-y border-border/60">
      <div className="container-luxury py-10 md:py-14">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 text-right">
            <div className="max-w-2xl">
              <h2 className="font-display font-medium text-[22px] md:text-[26px] leading-snug text-foreground">
                לא בטוחים מה מתאים למרחב שלכם?
              </h2>
              <p className="mt-1.5 text-[17px] leading-relaxed text-foreground-soft">
                ענו על כמה שאלות קצרות ונחזור אליכם עם המלצה אישית, בלי התחייבות.
              </p>
            </div>
            <Link
              to={to("/consult")}
              className="btn-shine shrink-0 self-start md:self-auto inline-flex items-center gap-2"
            >
              לייעוץ אישי
              <ArrowLeft className="w-4 h-4 ltr:-scale-x-100" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ConsultCTA;
