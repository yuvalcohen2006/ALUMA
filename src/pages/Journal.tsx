import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { materials } from "@/data/materials";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  tag: string | null;
  read_minutes: number | null;
};

const JournalPage = () => {
  const { to } = useLocalizedPath();
  const [articles, setArticles] = useState<Article[]>([]);
  const { t } = useTranslation("journal");

  // Whatever has been published in the admin's מגזין screen. The client called
  // this page a side thing, so an empty magazine renders nothing at all rather
  // than a heading over a gap.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("blog_posts")
          .select("id, slug, title, excerpt, tag, read_minutes")
          .eq("published", true)
          .order("published_at", { ascending: false });
        if (!cancelled && data) setArticles(data as Article[]);
      } catch {
        // The materials below are the point of the page and do not depend on
        // this request, so a failure here is silent.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      <SEO
        title={t("seo.title")}
        description={t("seo.description")}
        path="/journal"
      />

      <PageHero
        title={t("title")}
        subtitle={t("subtitle")}
      />

      {/* Materials get a card each, linking to the page that actually
          explains them. The client called this page "a side thing", so it
          points at the good content rather than trying to be it. */}
      <section className="bg-background">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16 pb-20 md:pb-28">
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {materials.map((m, i) => (
              <Reveal key={m.slug} delay={(i % 4) * 70}>
                <li>
                  <Link to={to(`/materials/${m.slug}`)} className="group block text-start">
                    <div className="aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={m.image}
                        alt={m.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-90"
                      />
                    </div>
                    <h3 className="mt-4 text-small text-foreground">{m.name}</h3>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>

          <div className="mt-12 text-start">
            <Link
              to={to("/materials")}
              className="text-small text-foreground underline underline-offset-[6px] decoration-1 hover:text-accent transition-colors"
            >
              {t("moreOnMaterials")}
            </Link>
          </div>
        </div>
      </section>

      {/* Articles, when there are any. A hairline-separated list rather than a
          grid of cards: the materials above are what this page is for, and a
          second block of photographs would compete with them. */}
      {articles.length > 0 && (
        <section className="bg-secondary">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16 py-20 md:py-28">
            <Reveal>
              <h2 className="text-start text-heading font-normal tracking-normal text-foreground">
                {t("fromMagazine")}
              </h2>
            </Reveal>

            <ul className="mt-10 md:mt-14 max-w-[820px]">
              {articles.map((a, i) => (
                <Reveal key={a.id} delay={(i % 4) * 70}>
                  <li className="border-t border-foreground/10 first:border-t-0">
                    <Link
                      to={to(`/journal/${a.slug}`)}
                      className="group block py-7 text-start"
                    >
                      <h3 className="text-body text-foreground group-hover:text-accent transition-colors">
                        {a.title}
                      </h3>
                      {a.excerpt && (
                        <p className="mt-2 max-w-[62ch] text-small text-foreground-soft">
                          {a.excerpt}
                        </p>
                      )}
                      {(a.tag || a.read_minutes) && (
                        <p className="mt-3 text-label text-muted-foreground">
                          {[a.tag, a.read_minutes ? t("readMinutes", { count: a.read_minutes }) : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </Link>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

    </Layout>
  );
};

export default JournalPage;
