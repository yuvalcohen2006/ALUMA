import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import { useMaterials, materialName, materialTagline } from "@/hooks/useMaterials";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { useSiteText } from "@/hooks/useSiteText";
import { decodeHash } from "@/lib/safe-hash";
import { useTranslation } from "react-i18next";

/**
 * The materials, one composition repeated.
 *
 * Every material is laid out identically — photograph on the reading-end side
 * at 380px, name, line and explanation on the reading-start side — because the
 * owner now writes these in the admin, and a layout that alternates sides or
 * changes with the amount of copy is a layout that eventually breaks on
 * somebody else's paragraph. One shape, any number of materials, nothing to
 * think about when adding the fifth.
 *
 * The photograph is deliberately not large. This page is read, not browsed:
 * the argument is in the words, and a full-bleed macro shot per material made
 * the page a slideshow you had to scroll past to find anything.
 *
 * ANCHORS. Each block carries its slug as an id, and the materials box on a
 * product page links to `/materials#slug`. Landing there scrolls to the block
 * and lights it for a moment — the same job the old per-material page did,
 * without four pages that each said one thing.
 */
const MaterialsPage = () => {
  const { lang } = useLocalizedPath();
  const text = useSiteText();
  const { t } = useTranslation("journal");
  const { materials, loading } = useMaterials();
  const { hash } = useLocation();
  const [scrolledTo, setScrolledTo] = useState<string | null>(null);
  /** The block just arrived at, lit for a moment. */
  const [found, setFound] = useState<string | null>(null);

  // The browser's own fragment scroll fires before the materials arrive and
  // lands on an empty page, so the scroll waits for the data — the same thing
  // the collections page has to do.
  useEffect(() => {
    if (loading || !hash) return;
    const slug = decodeHash(hash);
    if (!slug || slug === scrolledTo) return;
    const el = document.getElementById(slug);
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // Optional call: jsdom has no scrollIntoView, and a missing scroll must
    // not take the highlight down with it.
    el.scrollIntoView?.({ behavior: reduced ? "instant" : "smooth", block: "start" });
    setScrolledTo(slug);
    setFound(slug);
  }, [loading, hash, scrolledTo]);

  // The highlight is a class rather than CSS :target, which looks like the
  // obvious tool and does not work here: the blocks are rendered after the
  // data arrives, and a browser resolves :target at navigation time only. It
  // matched nothing on exactly the journey this exists for — following a
  // material from a product page.
  useEffect(() => {
    if (!found) return;
    const timer = window.setTimeout(() => setFound(null), 2600);
    return () => window.clearTimeout(timer);
  }, [found]);

  return (
    <Layout>
      <SEO
        title={t("seo.materialsTitle")}
        description={t("seo.materialsDescription")}
        path="/materials"
      />

      <section className="bg-background">
        <div className="mx-auto max-w-[1440px] px-5 pt-36 pb-12 md:px-10 md:pt-44 md:pb-16 lg:px-16">
          <Reveal>
            <h1 className="text-start text-display font-normal tracking-normal text-foreground">
              {text("materials.title", t("materials.title"))}
            </h1>
            <p className="mt-6 max-w-[58ch] text-start text-lead tracking-normal text-foreground-soft">
              {text("materials.subtitle", t("materials.subtitle"))}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10 md:pb-32 lg:px-16">
          <ul role="list" className="divide-y divide-border border-y border-border">
            {materials.map((m) => (
              <li
                key={m.slug}
                id={m.slug}
                // Clears the fixed header when the anchor scrolls it up.
                className={`material-block scroll-mt-28 md:scroll-mt-32 ${
                  found === m.slug ? "is-found" : ""
                }`}
              >
                <Reveal>
                  <div className="material-block-inner grid items-start gap-8 py-12 md:grid-cols-12 md:gap-12 md:py-16">
                    <div className="md:col-span-7 lg:col-span-8">
                      {/* <bdi>, not dir="auto".
                          dir="auto" reads the direction off the first strong
                          character, so "PolyStone" turned its whole heading
                          left-aligned in a right-to-left list, and a paragraph
                          that happened to open with the word threw its full
                          stop to the front of the line. The block keeps the
                          page's direction; only the name itself is isolated,
                          which is all that ever needed isolating. */}
                      <h2 className="text-start text-heading font-normal tracking-normal text-foreground">
                        <bdi>{materialName(m, lang)}</bdi>
                      </h2>
                      {materialTagline(m, lang) && (
                        <p className="mt-2 text-start text-small text-muted-foreground">
                          <bdi>{materialTagline(m, lang)}</bdi>
                        </p>
                      )}
                      <div className="mt-6 max-w-[62ch] space-y-5 text-start text-body tracking-normal text-foreground">
                        {m.body.map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    </div>

                    {m.image && (
                      <div className="md:col-span-5 lg:col-span-4">
                        <img
                          src={m.image}
                          alt={materialName(m, lang)}
                          loading="lazy"
                          decoding="async"
                          className="w-full max-w-[380px] rounded-sm bg-muted object-cover md:ms-auto"
                          style={{ aspectRatio: "4 / 3" }}
                        />
                      </div>
                    )}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Layout>
  );
};

export default MaterialsPage;
