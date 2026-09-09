import { useEffect, useState } from "react";
import Reveal from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

type Review = {
  id: string;
  quote: string;
  name: string;
  meta: string | null;
};

/**
 * Customer voices — the client asked for "לקוחות ממליצים".
 *
 * Two rules govern this section.
 *
 * It renders NOTHING until `site_reviews` has published rows. There are no
 * placeholder quotes and no fallback copy: inventing named customer reviews is
 * deceptive advertising, and this project already shipped fabricated ones once.
 * An empty homepage section is a smaller problem than a dishonest one, so the
 * page simply ends earlier until real quotes are entered in /admin/reviews.
 *
 * And it is a short list, not a carousel. Of the six reference brands studied
 * — Skargaarden, Tribù, Hem, Audo, Brafab, Hillerstorp — not one runs a
 * testimonial carousel. No arrows, no dots, no autoplay, no star ratings, no
 * avatars.
 */
const Testimonials = () => {
  const { t } = useTranslation("home");
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("site_reviews")
          .select("id, quote, name, meta")
          .eq("published", true)
          .order("sort_order", { ascending: true })
          .limit(3);
        if (!cancelled && data) setReviews(data as Review[]);
      } catch {
        // A failed query means no reviews to show, which is already the
        // default. Nothing to report and nothing to recover.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16 py-20 md:py-28 lg:py-36">
        {/* Every other band on this page announces itself, and this one jumped
            straight into three unattributed quotes — with no heading, a screen
            reader's landmark list gives no clue what the section is. */}
        <Reveal>
          <h2 className="text-start text-heading font-normal tracking-normal text-foreground">
            {t("reviews.title")}
          </h2>
        </Reveal>

        <ul role="list" className="mt-10 grid grid-cols-1 gap-x-10 gap-y-12 md:mt-14 md:grid-cols-3">
          {reviews.map((r, i) => (
            <li key={r.id} className="text-start">
              <Reveal delay={i * 70}>
                <blockquote className="text-body text-foreground">„{r.quote}”</blockquote>
                <div aria-hidden="true" className="mt-6 h-px w-10 bg-foreground/20" />
                <p className="mt-4 text-label text-foreground">{r.name}</p>
                {r.meta && <p className="mt-1 text-label text-muted-foreground">{r.meta}</p>}
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Testimonials;
