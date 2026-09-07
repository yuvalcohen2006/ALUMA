import Reveal from "@/components/Reveal";
import { useSiteText } from "@/hooks/useSiteText";
import terraceDusk from "@/assets/about/terrace-dusk.jpg";

/**
 * The warm-up the client asked for — composed against a photograph rather than
 * centred on an empty page.
 *
 * The photograph is 3024×1296, a 2.33:1 panorama, and it runs at that ratio
 * uncropped. Cropping it into a column beside the text was the obvious move and
 * it is the wrong one twice over: it throws away two thirds of the frame, and
 * the sofa — the only furniture in the shot — sits between 74% and 93% across,
 * so every centre crop loses the product and keeps the sea.
 *
 * Uncropped, the frame does the composition for us. In Hebrew the eye enters at
 * the RIGHT, which is where the sofa is; it leaves at the left, which is open
 * paving. So the copy plate takes the inline-end corner, covering nothing that
 * matters and breaking the photograph's bottom edge on its way onto the page.
 *
 * Direction: `end` is LEFT here. The plate is placed with logical properties
 * only, so on /en it moves to the right and meets the sofa instead — which is
 * also correct, because the eye enters from the other side there.
 */
const BrandStatement = () => {
  const t = useSiteText();
  return (
    <section className="bg-background pb-24 md:pb-32 lg:pb-40">
      <Reveal>
        <div className="relative">
          {/*
            Three crops, one file. Portrait on phones with the focal point
            pinned to 82% across so the sofa survives; 16:9 from sm where there
            is room for context; native 21:9 from lg where the plate needs the
            width to sit in. object-position is PHYSICAL on purpose — it points
            at a place in the photograph, which does not move when the page
            direction does.
          */}
          <img
            src={terraceDusk}
            alt="מרפסת אבן מעל הים בשעת בין ערביים, ספת חוץ בהירה תחת עץ זית"
            width={3024}
            height={1296}
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full object-cover object-[82%_50%] sm:aspect-[16/9] sm:object-center lg:aspect-[21/9]"
          />

          {/*
            The plate. Below the photograph on phones, rising 40px into it; from
            lg it sits over the open end of the frame and hangs 40px past the
            bottom edge onto the page. The section's own pb is what leaves room
            for that overhang — the plate must never be clipped, so nothing in
            this subtree may take overflow-hidden.
          */}
          <div
            className="relative mx-5 -mt-10 max-w-[30rem] bg-background p-7 sm:mx-8 sm:p-8
                       md:p-10 lg:absolute lg:bottom-0 lg:end-10 lg:mx-0 lg:mt-0
                       lg:w-[30rem] lg:max-w-none lg:translate-y-10 xl:end-16"
          >
            {/*
              The lead IS the heading, rather than a decorative eyebrow above
              one. Without a heading of some kind this band contributes nothing
              to the document outline and a screen reader navigating by heading
              goes from the hero straight to the collections, never learning the
              section exists. Promoting the sentence that was already the
              section's title costs no new copy and invents no new CMS row.
            */}
            <h2 className="text-heading font-normal tracking-normal text-foreground">
              {t("home.statement.lead", "אלומה נולדה מתוך חיבור בין חומר לאור.")}
            </h2>

            <p className="mt-4 text-body tracking-normal text-foreground-soft">
              {t(
                "home.statement.body",
                "אנחנו מתכננים ומייצרים ריהוט חוץ בהתאמה אישית — שלדת אלומיניום, בדי Sunbrella ומשטחי אבן שנבחרו כדי לעמוד בשמש, במלח ובגשם של ישראל. כל פריט נמדד למרחב שהוא נכנס אליו, ונשאר בחוץ כל השנה.",
              )}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default BrandStatement;
