import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { testimonials } from "@/data/testimonials";

type Review = {
  id: string;
  quote: string;
  name: string;
  /** City, or the product they bought. */
  meta: string | null;
};

/**
 * Customer quotes.
 *
 * Three columns of plain typography on a tinted panel — no cards, no stars, no
 * avatars, no oversized quotation glyphs. A grid of star-rated cards reads as a
 * reviews app bolted onto a shop; a quiet quote band reads as a brand that
 * doesn't need to shout. Stars belong on a product page, not here.
 *
 * Reads `site_reviews` when it exists and falls back to the placeholder set
 * otherwise, so the day someone enters three real reviews in the admin panel,
 * the invented ones disappear on their own with no code change. Those
 * placeholders are fabricated — see the banner in src/data/testimonials.ts —
 * and must not reach the live domain.
 */
const PLACEHOLDERS: Review[] = testimonials
  .filter((t) => !t.brand)
  .slice(0, 3)
  .map((t, i) => ({ id: `placeholder-${i}`, quote: t.text, name: t.name, meta: t.role }));

const ReviewsBand = () => {
  const [reviews, setReviews] = useState<Review[]>(PLACEHOLDERS);
  const [isReal, setIsReal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("site_reviews")
        .select("id, quote, name, meta")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .limit(3);
      if (cancelled) return;
      // The table may not exist yet; that is a fallback, not an error worth
      // surfacing to a visitor.
      if (!error && data && data.length > 0) {
        setReviews(data as Review[]);
        setIsReal(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="section-pad bg-background">
      <div className="container-luxury">
        <Reveal className="mb-12 md:mb-16 flex flex-col items-center">
          <SectionHeading>אנשים שכבר חיים את ה־Outdoor שלהם</SectionHeading>
        </Reveal>

        <Reveal>
          <div className="mx-auto max-w-[1100px] rounded-[14px] bg-[#F7F5F2] px-6 py-12 md:px-12 md:py-16">
            <ul className="grid gap-12 md:grid-cols-3 md:gap-14">
              {reviews.map((r) => (
                <li key={r.id} className="text-right">
                  <blockquote className="text-[18px] leading-[1.65] text-foreground text-pretty">
                    {r.quote}
                  </blockquote>
                  <span
                    aria-hidden="true"
                    className="block h-px w-10 my-6 bg-foreground/20"
                  />
                  <div className="text-[13px] uppercase tracking-[0.08em] text-foreground">
                    {r.name}
                  </div>
                  {r.meta && (
                    <div className="mt-1 text-[13px] text-foreground/55">{r.meta}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {!isReal && import.meta.env.DEV && (
          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            ⚠️ ציטוטים לדוגמה — יוחלפו בביקורות אמיתיות דרך לוח הניהול לפני העלייה לאוויר.
          </p>
        )}
      </div>
    </section>
  );
};

export default ReviewsBand;
