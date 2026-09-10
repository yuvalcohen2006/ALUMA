import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import TileCard from "@/components/TileCard";
import { useCollections } from "@/hooks/useCollectionsData";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { useTranslation } from "react-i18next";
import { useSiteText } from "@/hooks/useSiteText";
import { localizedName } from "@/lib/localized-name";
import TileFallback from "@/components/TileFallback";

/** Three, not eight. Audo shows four; Skargaarden uses text links; Hillerstorp
 *  shows none at all. Eight tiles was more than any reference brand puts on a
 *  home page, and it is what the client meant by "no seduction" — the whole
 *  catalogue arrived before he had said anything. */
const MAX = 3;

const FeaturedCollections = () => {
  const { collections, loading } = useCollections();
  const { to, lang } = useLocalizedPath();
  const t = useSiteText();
  const { t: tr } = useTranslation("home");
  const shown = collections.slice(0, MAX);

  // Nothing to show is a reason to render nothing, not to render a hole.
  if (loading || shown.length === 0) return null;

  return (
    // A hairline at each edge, because the band no longer separates itself.
    // Sand on cream was 1.22:1; #F8F8F8 on white is 1.06:1, and this site has
    // never had any separator other than fill.
    <section className="border-y border-border bg-secondary">
      <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28 lg:px-16 lg:py-36">
        <Reveal>
          <h2 className="text-start text-heading font-normal tracking-normal text-foreground">
            {t("home.collections.title", tr("collections.title"))}
          </h2>
        </Reveal>

        {/*
          Reveal sits INSIDE the li, not around it. Wrapped the other way it
          produced `ul > div > li`, which is invalid and drops the list
          semantics the role attribute is there to guarantee — and it put a
          div between .tile-grid and the li that the sibling-dimming rule
          needs to reach.
        */}
        <ul
          role="list"
          className="tile-grid tile-soften mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-3 md:mt-14"
        >
          {shown.map((c, i) => {
            const name = localizedName(lang, c.name_he, c.name_en);
            return (
            <li key={c.id}>
              <Reveal delay={i * 70}>
                <TileCard
                  to={to(`/collections/${c.slug}`)}
                  image={c.image_url}
                  fallback={<TileFallback name={name} />}
                  alt=""
                  title={name}
                  aspect="3/4"
                  eager={i === 0}
                  // The name rides a white plate across the foot of the
                  // photograph rather than sitting under it.
                  nameplate
                />
              </Reveal>
            </li>
            );
          })}
        </ul>

        <Reveal>
          <div className="mt-12 text-start">
            {/* A text link, not a filled button. One button per page, and it
                belongs on the quote request. */}
            <Link
              to={to("/collections")}
              className="text-small text-foreground underline decoration-1 underline-offset-[6px] transition-colors hover:text-accent"
            >
              {tr("collections.all")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FeaturedCollections;
