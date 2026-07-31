import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionRule from "@/components/SectionRule";
import { supabase } from "@/integrations/supabase/client";
import { materials } from "@/data/materials";
import { useLocalizedPath } from "@/lib/useLocalizedPath";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tag: string | null;
  read_minutes: number | null;
  published_at: string | null;
};

const dateFmt = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const formatDate = (iso: string | null) =>
  iso ? dateFmt.format(new Date(iso)) : null;

/**
 * Meta line: date · tag · read time, hairline-separated, nulls dropped.
 */
const MetaLine = ({ post }: { post: Post }) => {
  const parts = [
    formatDate(post.published_at),
    post.tag,
    post.read_minutes ? `${post.read_minutes} דק׳ קריאה` : null,
  ].filter(Boolean) as string[];

  if (parts.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-y-1 text-[13px] text-foreground/50">
      {parts.map((p, i) => (
        <span key={`${i}-${p}`} className="inline-flex items-center whitespace-nowrap">
          {p}
          {i < parts.length - 1 && (
            <span aria-hidden="true" className="w-px h-3 bg-foreground/25 shrink-0 mx-2.5" />
          )}
        </span>
      ))}
    </div>
  );
};

/**
 * Cover image with a graceful empty state — a post with no cover must not
 * collapse the card and pull the whole row out of alignment.
 */
const Cover = ({
  src,
  alt,
  ratio,
  eager = false,
}: {
  src: string | null;
  alt: string;
  ratio: string;
  eager?: boolean;
}) => (
  <div className={`${ratio} overflow-hidden rounded-[14px] bg-secondary`}>
    {src && (
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    )}
  </div>
);

const JournalPage = () => {
  const { to } = useLocalizedPath();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("blog_posts")
          .select("id, slug, title, excerpt, cover_image_url, tag, read_minutes, published_at")
          .eq("published", true)
          .order("published_at", { ascending: false });
        if (cancelled) return;
        const rows = (data as Post[]) ?? [];
        if (import.meta.env.VITE_USE_DEMO_DATA !== "0" && rows.length === 0) {
          const { demoPosts } = await import("@/data/demoBlog");
          setPosts(demoPosts as Post[]);
          return;
        }
        setPosts(rows);
      } catch {
        // A thrown query (offline, CORS) must still end the load, or the page
        // sits on its skeleton forever.
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const topics = useMemo(() => {
    const seen = new Map<string, number>();
    for (const p of posts) {
      if (p.tag) seen.set(p.tag, (seen.get(p.tag) ?? 0) + 1);
    }
    return [...seen.keys()].sort((a, b) => a.localeCompare(b, "he"));
  }, [posts]);

  const visible = useMemo(
    () => (topic ? posts.filter((p) => p.tag === topic) : posts),
    [posts, topic]
  );

  // The newest post leads; the rest run as a feed. When a filter is on, no post
  // is "featured" — promoting one out of a filtered set reads as arbitrary.
  const featured = !topic && visible.length > 0 ? visible[0] : null;
  const feed = featured ? visible.slice(1) : visible;

  return (
    <Layout>
      <SEO
        title="שווה לדעת | Aluma"
        description="החומרים שמהם עשוי ריהוט החוץ שלנו, ומה כדאי לדעת לפני שקונים: מדריכים, סיפורים והצצה אל מאחורי הקלעים."
        path="/journal"
      />

      <PageHero
        title="שווה לדעת"
        subtitle="על החומרים, על המלאכה, ועל מה שכדאי לדעת לפני שבוחרים ריהוט שנשאר בחוץ כל השנה."
      />

      {/* MATERIALS — a persistent strip above the feed, not mixed into it.
          Materials are evergreen and articles are chronological; interleaved,
          the Sunbrella explainer sinks below the fold forever and never
          resurfaces. Small square tiles on a light surface, and none of the
          three glow layers the old dark bands carried — a coloured glow on
          white just reads as a printing error. */}
      <section className="pb-4 bg-background">
        <div className="container-luxury">
          <Reveal>
            <h2 className="font-display font-bold text-[26px] md:text-[30px] text-primary text-right">
              החומרים
            </h2>
            <SectionRule on="light" variant="hairline" />
          </Reveal>

          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
            {materials.map((m, i) => (
              <Reveal key={m.slug} delay={i * 70}>
                <li>
                  <Link to={to(`/materials/${m.slug}`)} className="group block text-right">
                    <div className="aspect-square overflow-hidden rounded-[14px] bg-secondary">
                      <img
                        src={m.image}
                        alt={m.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    </div>
                    <h3 className="mt-3 text-[18px] leading-snug text-foreground decoration-1 underline-offset-4 group-hover:underline">
                      {m.name}
                    </h3>
                    <p className="mt-1 text-[15px] leading-snug text-foreground/55 line-clamp-2">
                      {m.tagline}
                    </p>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="section-pad bg-background">
        <div className="container-luxury">
          <Reveal>
            <h2 className="font-display font-bold text-[26px] md:text-[30px] text-primary text-right">
              סיפורים ומדריכים
            </h2>
            <SectionRule on="light" variant="hairline" />
          </Reveal>

          {/* Chips rather than tabs: chips wrap and scroll on a phone, tabs
              don't. */}
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              <button
                type="button"
                onClick={() => setTopic(null)}
                aria-pressed={topic === null}
                className={`h-8 px-4 rounded-full border text-[13px] transition-colors ${
                  topic === null
                    ? "bg-foreground text-background border-foreground"
                    : "border-foreground/15 text-foreground/70 hover:border-foreground/40"
                }`}
              >
                הכל
              </button>
              {topics.map((tg) => (
                <button
                  key={tg}
                  type="button"
                  onClick={() => setTopic(tg === topic ? null : tg)}
                  aria-pressed={topic === tg}
                  className={`h-8 px-4 rounded-full border text-[13px] transition-colors ${
                    topic === tg
                      ? "bg-foreground text-background border-foreground"
                      : "border-foreground/15 text-foreground/70 hover:border-foreground/40"
                  }`}
                >
                  {tg}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid gap-10 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="aspect-[3/2] rounded-[14px] bg-secondary" />
                  <div className="h-5 w-3/4 rounded-[10px] bg-secondary" />
                  <div className="h-4 w-full rounded-[10px] bg-secondary" />
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <p className="text-[18px] text-foreground/60">
              עוד לא פרסמנו כאן כתבות. בקרוב.
            </p>
          ) : (
            <>
              {featured && (
                <Reveal>
                  {/* 60/40, no card chrome — the photograph provides the
                      containment. */}
                  <Link
                    to={to(`/journal/${featured.slug}`)}
                    className="group grid md:grid-cols-5 gap-6 md:gap-10 items-center mb-14 md:mb-20"
                  >
                    <div className="md:col-span-3">
                      <Cover
                        src={featured.cover_image_url}
                        alt={featured.title}
                        ratio="aspect-[3/2]"
                        eager
                      />
                    </div>
                    <div className="md:col-span-2 text-right">
                      <MetaLine post={featured} />
                      <h3 className="mt-3 font-display font-bold text-[clamp(24px,3.5vw,36px)] leading-tight text-foreground group-hover:text-accent transition-colors">
                        {featured.title}
                      </h3>
                      {featured.excerpt && (
                        <p className="mt-3 max-w-[52ch] text-[17px] leading-relaxed text-foreground-soft text-pretty">
                          {featured.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              )}

              {feed.length > 0 && (
                <ul className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {feed.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 3) * 70}>
                      <li>
                        <Link to={to(`/journal/${p.slug}`)} className="group block text-right">
                          <Cover
                            src={p.cover_image_url}
                            alt={p.title}
                            ratio="aspect-[3/2]"
                          />
                          <div className="mt-4 space-y-2">
                            <MetaLine post={p} />
                            <h3 className="font-display text-[21px] leading-snug text-foreground line-clamp-2 decoration-1 underline-offset-4 group-hover:underline">
                              {p.title}
                            </h3>
                            {p.excerpt && (
                              <p className="text-[15px] leading-[1.55] text-foreground/65 line-clamp-2 text-pretty">
                                {p.excerpt}
                              </p>
                            )}
                          </div>
                        </Link>
                      </li>
                    </Reveal>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default JournalPage;
