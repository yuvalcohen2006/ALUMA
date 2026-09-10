import Reveal from "@/components/Reveal";
import { useTranslation } from "react-i18next";
import { useSiteText } from "@/hooks/useSiteText";
import Motes from "@/components/home/Motes";
import lightAndMatter from "@/assets/light-and-matter.webp";

/**
 * The warm-up: the sentence, and a picture of what the sentence is about.
 *
 * This band has been five things now. It was a charcoal slab, then a warm
 * off-white ground with two drifting washes of coloured light and a grain over
 * it — an eight-stop gradient standing in for a photograph, on the argument
 * that "a real one would be a picture of something, and the sentence is not
 * about a thing".
 *
 * That argument was wrong twice over. The washes read as a brown gradient
 * rather than as light, and the sentence IS about a thing: material meeting
 * light. So the band is white with the photograph the sentence describes,
 * reduced to its smallest true form: one beam, one prism, one spectrum. An
 * earlier version staged four materials around it and read as a product shot
 * of a mood board — the sentence is about light meeting matter, and that is
 * exactly two things.
 *
 * THE PICTURE HAS NO EDGES. Its ground was lifted to exactly #FFFFFF and its
 * outer 130px feathered into that white, so there is no rectangle, no corner
 * and no border — the prism and its light simply sit on the page. That is also
 * why there is no radius here: a radius implies a frame, and the whole point is
 * that there is not one.
 *
 * THE PAIR IS CENTRED, NOT SPREAD. A two-column grid across a 1440px container
 * pushed the words to one edge and the picture to the other with a third of a
 * screen of nothing in between. `justify-center` on a flex row sizes both to
 * their content and stands them side by side, so the gap is the gap and
 * nothing else. In Hebrew the row runs right-to-left, which puts the words on
 * the right and the picture on the left, and mirrors on /en for free.
 *
 * THE LINE BREAKS ARE THE COPY. The paragraph breaks mid-sentence, after
 * "שלדת אלומיניום,", so they cannot be derived from the text — they have to be
 * in it. The field is `multiline` in the admin, so the owner keeps control of
 * them by pressing Enter, and `whitespace-pre-line` honours them while still
 * wrapping normally when a phone is too narrow for a line.
 */
const BrandStatement = () => {
  const t = useSiteText();
  // The translated string is the FALLBACK, not the Hebrew literal. useSiteText
  // returns its fallback verbatim on /en — the editable layer is Hebrew-only,
  // by design — so a hardcoded Hebrew second argument put Hebrew copy on the
  // English page.
  const { t: tr } = useTranslation("home");

  return (
    <section className="relative isolate overflow-hidden bg-background">
      <Motes />

      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-8 px-5 py-20 md:flex-row md:justify-center md:gap-10 md:px-10 md:py-24 lg:gap-14 lg:px-16 lg:py-28">
        <Reveal className="min-w-0">
          {/*
            The lead IS the heading. Without one this band contributes nothing
            to the document outline and a screen reader navigating by heading
            goes from the hero straight to the collections.

            `md:whitespace-nowrap` holds it to one line wherever the row is a
            row, and lets it wrap on a phone, where forcing it would push the
            section wider than the screen.
          */}
          <h2 className="text-heading font-normal tracking-normal text-foreground md:whitespace-nowrap">
            {t("home.statement.lead", tr("statement.lead"))}
          </h2>

          <p className="mt-5 whitespace-pre-line text-body tracking-normal text-foreground-soft">
            {t("home.statement.body", tr("statement.body"))}
          </p>
        </Reveal>

        <Reveal delay={90} className="w-full max-w-[400px] shrink-0">
          <img
            src={lightAndMatter}
            alt=""
            width={880}
            height={920}
            loading="lazy"
            decoding="async"
            className="mx-auto w-full"
          />
        </Reveal>
      </div>
    </section>
  );
};

export default BrandStatement;
