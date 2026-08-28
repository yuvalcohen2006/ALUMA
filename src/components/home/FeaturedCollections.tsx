import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import { useCollections } from "@/hooks/useCollectionsData";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { useSiteText } from "@/hooks/useSiteText";

/** Three, not eight. Audo shows four; Skargaarden uses text links; Hillerstorp
 *  shows none at all. Eight tiles was more than any reference brand puts on a
 *  home page, and it is what the client meant by "no seduction" — the whole
 *  catalogue arrived before he had said anything. */
const MAX = 3;

const FeaturedCollections = () => {
  const { collections, loading } = useCollections();
  const { to } = useLocalizedPath();
  const t = useSiteText();
  const shown = collections.slice(0, MAX);

  // Nothing to show is a reason to render nothing, not to render a hole.
  if (loading || shown.length === 0) return null;

  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16 py-20 md:py-28 lg:py-36">
        <Reveal>
          <h2 className="text-start text-heading font-normal tracking-normal text-foreground">
            {t("home.collections.title", "קולקציות נבחרות")}
          </h2>
        </Reveal>

        <ul className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-12">
          {shown.map((c, i) => (
            <Reveal key={c.id} delay={i * 70}>
              <li>
                {/* No border, no shadow, no radius: the photograph sits on the
                    page and the type sits under it. Hover is a slow crossfade
                    of the image only. */}
                <Link to={to(`/collections/${c.slug}`)} className="group block text-start">
                  <div className="aspect-[3/4] overflow-hidden bg-muted">
                    {c.image_url && (
                      <img
                        src={c.image_url}
                        alt={c.name_he}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                        className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-90"
                      />
                    )}
                  </div>
                  <h3 className="mt-4 text-small text-foreground">{c.name_he}</h3>
                  {c.intro && (
                    <p className="mt-1 text-label text-muted-foreground line-clamp-1">
                      {c.intro}
                    </p>
                  )}
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>

        <Reveal>
          <div className="mt-12 text-start">
            {/* A text link, not a filled button. One button per page, and it
                belongs on the quote request. */}
            <Link
              to={to("/collections")}
              className="text-small text-foreground underline underline-offset-[6px] decoration-1 hover:text-accent transition-colors"
            >
              לכל הקטלוג
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FeaturedCollections;
