import Reveal from "@/components/Reveal";
import { useTranslation } from "react-i18next";
import { useSiteText } from "@/hooks/useSiteText";
import lightAndMatter from "@/assets/light-and-matter.webp";

/**
 * The warm-up: the sentence, and a picture of what the sentence is about.
 *
 * This band has been four things now. It was a charcoal slab, then a warm
 * off-white ground with two drifting washes of coloured light and a grain over
 * it — an eight-stop gradient standing in for a photograph, on the argument
 * that "a real one would be a picture of something, and the sentence is not
 * about a thing".
 *
 * That argument was wrong twice over. The washes read as a brown gradient
 * rather than as light, and the sentence IS about a thing: material meeting
 * light. So the band is now crystal white with the photograph the sentence
 * describes, reduced to its smallest true form: one beam, one prism, one
 * spectrum. An earlier version staged four materials around it and read as a
 * product shot of a mood board — the sentence is about light meeting matter,
 * and that is exactly two things.
 *
 * ORDER IS THE LAYOUT. The text comes first in the DOM and the photograph
 * second, so on the Hebrew site the words sit right and the picture left, and
 * the whole thing mirrors correctly on /en without a second rule.
 *
 * THE PICTURE HAS NO EDGES. Its ground was lifted to exactly #FFFFFF and its
 * outer 130px feathered into that white, so there is no rectangle, no corner
 * and no border — the prism and its light simply sit on the page. That is also
 * why there is no `rounded-sm` here: a radius implies a frame, and the whole
 * point is that there is not one.
 */
const BrandStatement = () => {
  const t = useSiteText();
  // The translated string is the FALLBACK, not the Hebrew literal. useSiteText
  // returns its fallback verbatim on /en — the editable layer is Hebrew-only,
  // by design — so a hardcoded Hebrew second argument put Hebrew copy on the
  // English page.
  const { t: tr } = useTranslation("home");

  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-20 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:gap-14 md:px-10 md:py-24 lg:gap-20 lg:px-16 lg:py-28">
        <Reveal>
          {/*
            The lead IS the heading. Without one this band contributes nothing
            to the document outline and a screen reader navigating by heading
            goes from the hero straight to the collections.

            `lg:whitespace-nowrap` holds it to one line where there is room for
            one — at 30px this sentence measures about 600px against a column
            of roughly 700 — and lets it wrap on a phone, where forcing it
            would push the section wider than the screen.
          */}
          <h2 className="text-heading font-normal tracking-normal text-foreground lg:whitespace-nowrap">
            {t("home.statement.lead", tr("statement.lead"))}
          </h2>

          <p className="mt-5 max-w-[46ch] text-body tracking-normal text-foreground-soft">
            {t("home.statement.body", tr("statement.body"))}
          </p>
        </Reveal>

        <Reveal delay={90}>
          <img
            src={lightAndMatter}
            alt=""
            width={880}
            height={920}
            loading="lazy"
            decoding="async"
            className="w-full"
          />
        </Reveal>
      </div>
    </section>
  );
};

export default BrandStatement;
