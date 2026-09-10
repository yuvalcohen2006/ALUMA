import Reveal from "@/components/Reveal";
import { useTranslation } from "react-i18next";
import { useSiteText } from "@/hooks/useSiteText";
import Motes from "@/components/home/Motes";
import lightAndMatter from "@/assets/light-and-matter.webp";
import { statementLines } from "@/lib/statement-lines";

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
 * THE LINE BREAKS ARE COMPUTED, NOT STORED. Three lines, and the first break
 * falls mid sentence, so no measure produces them — see lib/statement-lines.
 * They were briefly shipped as a database migration, which made the layout
 * depend on someone running a script and left the page showing four lines for
 * a day. Each line is its own block, so three lines is what renders.
 *
 * THE ROW WRAPS. Side by side needs about 600px of text plus a 400px picture,
 * which does not fit on a 1024px laptop — so the row is allowed to wrap rather
 * than crushing the picture to a stamp. The browser puts them side by side
 * when there is room and stacks them when there is not.
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

      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-8 px-5 py-20 md:px-10 md:py-24 lg:flex-row lg:flex-wrap lg:justify-center lg:gap-14 lg:px-16 lg:py-28">
        <Reveal className="lg:shrink-0">
          {/*
            The lead IS the heading. Without one this band contributes nothing
            to the document outline and a screen reader navigating by heading
            goes from the hero straight to the collections.

            `md:whitespace-nowrap` holds it to one line from 768px up — where
            the section is full width whether or not the picture is beside it —
            and lets it wrap on a phone, where forcing it would push the
            section wider than the screen.
          */}
          <h2 className="text-heading font-normal tracking-normal text-foreground md:whitespace-nowrap">
            {t("home.statement.lead", tr("statement.lead"))}
          </h2>

          <p className="mt-5 text-body tracking-normal text-foreground-soft">
            {/* Keyed by position, not by content: two identical lines is not a
                thing this copy does, but it is not a thing React should warn
                about either, and the list is static. */}
            {statementLines(t("home.statement.body", tr("statement.body"))).map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </p>
        </Reveal>

        {/* Dropped 50px against the words, so the picture's mass sits with
            the paragraph rather than riding above the heading. */}
        <Reveal delay={90} className="w-full max-w-[400px] lg:mt-[50px]">
          <img
            src={lightAndMatter}
            alt=""
            width={1200}
            height={900}
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
