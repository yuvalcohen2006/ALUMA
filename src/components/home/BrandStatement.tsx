import Reveal from "@/components/Reveal";
import { useSiteText } from "@/hooks/useSiteText";

/**
 * The warm-up, as light falling on a surface.
 *
 * The paragraph says Aluma was born from a meeting of material and light, so
 * the band behind it is exactly that and nothing else: two washes of coloured
 * light drifting across a warm off-white ground, with a grain that stands in
 * for the surface they land on. No photograph — a real one would be a picture
 * of something, and the sentence is not about a thing.
 *
 * This band has been three things now, and the charcoal version was the wrong
 * one: it read as a slab dropped into a white page. Light is the correct
 * material for a paragraph about light.
 *
 * Three details carry it, and all three are the difference between this and a
 * blurred blob:
 *
 * EIGHT STOPS, not two. A two-stop radial fade has a mathematically visible
 * Mach band at its midpoint. The curve here holds near-full strength through
 * the first fifth, falls away hard through the middle, then tails out.
 *
 * MULTIPLY, not overlay. On a white backdrop overlay is the identity function,
 * so the grain from the charcoal version would be measurably invisible here.
 *
 * TRANSFORM ONLY, at 0.6px per second. Slow enough that the eye cannot catch
 * it moving, and cheap enough that it never leaves the compositor. Motion is
 * added under `no-preference` rather than removed under `reduce`, and the
 * still version parks the washes mid-drift rather than at frame zero.
 *
 * The CSS lives in index.css because an eight-stop gradient is not something
 * to express as a Tailwind arbitrary value and expect anyone to review.
 */
const BrandStatement = () => {
  const t = useSiteText();
  return (
    <section className="band-light relative isolate overflow-hidden">
      <div aria-hidden="true" className="band-wash band-wash--warm" />
      <div aria-hidden="true" className="band-wash band-wash--cool" />
      <div aria-hidden="true" className="band-grain" />

      <div className="relative mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <Reveal>
          {/*
            The lead IS the heading. Without one this band contributes nothing
            to the document outline and a screen reader navigating by heading
            goes from the hero straight to the collections.
          */}
          <h2 className="max-w-[24ch] text-heading font-normal tracking-normal text-foreground">
            {t("home.statement.lead", "אלומה נולדה מתוך חיבור בין חומר לאור.")}
          </h2>

          <p className="mt-5 max-w-[56ch] text-body tracking-normal text-foreground-soft">
            {t(
              "home.statement.body",
              "אנחנו מתכננים ומייצרים ריהוט חוץ בהתאמה אישית — שלדת אלומיניום, בדי Sunbrella ומשטחי אבן שנבחרו כדי לעמוד בשמש, במלח ובגשם של ישראל. כל פריט נמדד למרחב שהוא נכנס אליו, ונשאר בחוץ כל השנה.",
            )}
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default BrandStatement;
