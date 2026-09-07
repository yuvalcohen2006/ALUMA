import Reveal from "@/components/Reveal";
import { useSiteText } from "@/hooks/useSiteText";

/**
 * The warm-up, as a field of colour rather than a picture.
 *
 * This band has now been three things. It was a paragraph centred on an empty
 * page, which said nothing. It was a full-bleed photograph with the copy on a
 * plate, which said too much and stood about 900px tall directly under a hero
 * that is already a full screen of photograph — two big images back to back
 * before a single word had been read.
 *
 * So: no photograph. A solid charcoal field, roughly 350px, carrying one
 * sentence and one paragraph. It works for three reasons beyond being shorter.
 * It is the only tonal anchor between the hero and the footer, on a page that
 * is otherwise white and a very light grey. It cannot compete with the
 * furniture, because there is nothing in it to look at. And a brand statement
 * is the one place on a commercial site where having nothing to sell is the
 * point.
 *
 * The two radial washes are the "vague" part: no asset, no request, a few
 * hundred bytes of CSS, and soft enough that they read as light in a room
 * rather than as a gradient. The grain on top is what stops a large flat dark
 * field from banding on an 8-bit panel, which is the specific way a section
 * like this looks cheap.
 */
const BrandStatement = () => {
  const t = useSiteText();
  return (
    <section className="relative isolate overflow-hidden bg-foreground text-background">
      {/*
        Warm wash toward the reading start, cool one away from it. Positions are
        physical percentages because a background-image has no logical axis —
        on /en the light falls from the other side, which is the correct
        behaviour for a light source rather than a mistake.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(115% 85% at 88% 0%, hsl(14 47% 58% / 0.18) 0%, transparent 62%)," +
            "radial-gradient(85% 75% at 8% 100%, hsl(0 0% 100% / 0.07) 0%, transparent 58%)",
        }}
      />

      {/*
        Grain. feTurbulence rendered once into a data URI — no network request,
        no asset to lose. At 3.5% it is invisible as texture and does exactly
        one job: breaking up the smooth gradient so it cannot band.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <Reveal>
          {/*
            The lead IS the heading. Without one this band contributes nothing
            to the document outline and a screen reader navigating by heading
            goes from the hero straight to the collections.
          */}
          <h2 className="max-w-[24ch] text-heading font-normal tracking-normal text-background">
            {t("home.statement.lead", "אלומה נולדה מתוך חיבור בין חומר לאור.")}
          </h2>

          <p className="mt-5 max-w-[56ch] text-body tracking-normal text-background/70">
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
