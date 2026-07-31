import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import FilterSidebar, { type FilterGroup } from "@/components/FilterSidebar";
import ShineButton from "@/components/ui/shine-button";
import { useFilterParams } from "@/hooks/useFilterParams";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import logo from "@/assets/aluma-logo.png";

const SITE = "https://alumaoutdoor.com";

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

/* ─────────────────────────── formatting ───────────────────────────
   Every one of these fields is nullable in the table, so each helper
   returns null rather than a placeholder — the callers drop the whole
   line when there is nothing to say. */

const hebrewDate = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Null unless the string parses as a real date — junk ISO never reaches the page. */
const validDate = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (iso: string | null) => {
  const d = validDate(iso);
  return d ? hebrewDate.format(d) : null;
};

const formatRead = (minutes: number | null) => {
  if (!minutes || minutes < 1) return null;
  return minutes === 1 ? "דקת קריאה" : `${minutes} דקות קריאה`;
};

/* ─────────────────────────── small parts ─────────────────────────── */

/**
 * A meta line: whatever survived the null checks, separated by hairlines.
 * Renders nothing at all when every part is missing, so a post with no tag,
 * no read time and no date never leaves an empty row behind.
 */
const MetaLine = ({
  parts,
  light = false,
  className,
}: {
  parts: (ReactNode | null)[];
  light?: boolean;
  className?: string;
}) => {
  const shown = parts.filter((p): p is ReactNode => p !== null && p !== undefined && p !== "");
  if (shown.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-3 text-[18px]", className)}>
      {shown.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && (
            // shrink-0 or flex would collapse the hairline to nothing once the
            // row wraps on a narrow screen.
            <span
              className={cn("w-px h-4 shrink-0", light ? "bg-background/35" : "bg-primary/45")}
              aria-hidden="true"
            />
          )}
          {part}
        </Fragment>
      ))}
    </div>
  );
};

/**
 * The page's one repeated marker: a short rule, then a word at 18px. Carries the
 * topic on the light spreads and the "כתבת השער" label on the charcoal one, so
 * the same device runs top to bottom instead of a tracked eyebrow label.
 */
const TagMark = ({
  label,
  light = false,
  className,
}: {
  label: string;
  light?: boolean;
  className?: string;
}) => (
  <div className={cn("flex items-center gap-3", className)}>
    <span
      className={cn("h-px w-8 shrink-0", light ? "bg-secondary/70" : "bg-primary/70")}
      aria-hidden="true"
    />
    <span className={cn("text-[18px]", light ? "text-secondary" : "text-foreground")}>{label}</span>
  </div>
);

/**
 * Cover photo. When a post has none, the frame fills with sand and carries the
 * mark instead — a quiet masthead block rather than a hole in the layout.
 *
 * The photo is always decorative: every caller wraps it in a link whose visible
 * text already carries the title, so alt text here would just say it twice.
 */
const Cover = ({
  post,
  ratio,
  eager = false,
  className,
}: {
  post: Post;
  ratio: string;
  eager?: boolean;
  className?: string;
}) => (
  <div className={cn("relative overflow-hidden bg-secondary", ratio, className)}>
    {post.cover_image_url ? (
      <img
        src={post.cover_image_url}
        alt=""
        aria-hidden="true"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : undefined}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.06]"
      />
    ) : (
      <span className="absolute inset-0 flex items-center justify-center">
        <img src={logo} alt="" aria-hidden="true" className="h-9 md:h-11 w-auto opacity-25" />
      </span>
    )}
  </div>
);

/* ─────────────────────────── the spreads ─────────────────────────── */

/**
 * Cover story — the newest post of the current view, on the one charcoal band
 * of the page. Photo on the right (RTL start) at 7/12, the write-up on the left.
 */
const CoverStory = ({ post }: { post: Post }) => (
  <section className="bg-foreground py-14 md:py-20" aria-label="כתבת השער">
    <div className="container-luxury">
      <Reveal>
        {/* The whole spread is the hover group, so warming the photo also answers
            a pointer resting on the write-up beside it. */}
        <div className="group grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* The photo repeats the title link and the CTA — hidden from assistive
              tech and out of the tab order so the spread is announced once.
              active:transform-none: the global press would shrink a band this
              wide, which reads as a layout jolt rather than feedback. */}
          <Link
            to={`/blog/${post.slug}`}
            tabIndex={-1}
            aria-hidden="true"
            className="block order-1 lg:col-span-7 min-w-0 active:transform-none"
          >
            <Cover
              post={post}
              ratio="aspect-[16/10]"
              eager
              className="rounded-[14px] border border-background/15 transition-all duration-300 group-hover:border-background/40"
            />
          </Link>

          <div className="order-2 lg:col-span-5 min-w-0 text-right">
            <TagMark label="כתבת השער" light />

            <h2 className="font-display font-bold text-[26px] leading-snug text-background mt-4">
              <Link to={`/blog/${post.slug}`} className="transition-smooth hover:text-secondary">
                {post.title}
              </Link>
            </h2>

            <div className="w-20 h-[2px] bg-background/40 mt-5" aria-hidden="true" />

            {post.excerpt && (
              <p className="text-[20px] leading-relaxed text-background/75 mt-5 text-pretty">
                {post.excerpt}
              </p>
            )}

            <MetaLine
              light
              className="mt-6 text-background/60"
              parts={[
                post.tag ? (
                  <span key="tag" className="text-secondary">
                    {post.tag}
                  </span>
                ) : null,
                formatRead(post.read_minutes),
                formatDate(post.published_at),
              ]}
            />

            <div className="mt-8">
              <ShineButton to={`/blog/${post.slug}`} invert>
                לקריאת הכתבה
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </ShineButton>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/**
 * Half-page item — photo, then the write-up bare on the page underneath. No card
 * chrome: the framed photo lifts on hover and the text stays put, the way the
 * category tiles on the home screen behave.
 */
const HalfPage = ({ post }: { post: Post }) => (
  <Link to={`/blog/${post.slug}`} className="group block min-w-0 text-right">
    <Cover
      post={post}
      ratio="aspect-[4/3]"
      className="rounded-[14px] border border-border transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/60 group-hover:shadow-luxury"
    />

    <div className="mt-5">
      {post.tag && <TagMark label={post.tag} className="mb-3" />}

      <h3 className="font-display font-normal text-[22px] leading-snug text-foreground transition-smooth group-hover:text-accent">
        {post.title}
      </h3>

      {post.excerpt && (
        <p className="text-[20px] leading-relaxed text-foreground-soft mt-3 line-clamp-3 text-pretty">
          {post.excerpt}
        </p>
      )}

      <MetaLine
        className="mt-4 text-muted-foreground"
        parts={[formatRead(post.read_minutes), formatDate(post.published_at)]}
      />
    </div>
  </Link>
);

/**
 * Full-width band — a sand slab that breaks the two-up rhythm. `flip` mirrors
 * the photo to the other side so consecutive bands zig-zag down the page.
 */
const Band = ({ post, flip }: { post: Post; flip: boolean }) => (
  <Link
    to={`/blog/${post.slug}`}
    // active:transform-none for the same reason as the cover story: the global
    // press shrinks the whole slab, and at this width it reads as a jolt.
    className="group grid md:grid-cols-12 overflow-hidden rounded-[14px] border border-border bg-secondary transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-luxury active:transform-none"
  >
    <Cover
      post={post}
      ratio="aspect-[16/10] md:aspect-auto"
      // Warm white rather than sand: a post with no cover falls back to a mark on
      // a panel, and that panel has to read as a panel against the sand slab.
      className={cn(
        "md:col-span-5 md:min-h-[320px] bg-background",
        flip ? "md:order-2" : "md:order-1",
      )}
    />

    <div
      className={cn(
        "md:col-span-7 min-w-0 p-7 md:p-10 lg:p-12 flex flex-col justify-center text-right",
        flip ? "md:order-1" : "md:order-2",
      )}
    >
      {post.tag && <TagMark label={post.tag} className="mb-3" />}

      <h3 className="font-display font-normal text-[22px] leading-snug text-foreground">
        {post.title}
      </h3>

      {post.excerpt && (
        <p className="text-[20px] leading-relaxed text-foreground/75 mt-3 line-clamp-3 text-pretty">
          {post.excerpt}
        </p>
      )}

      <MetaLine
        className="mt-6 text-muted-foreground"
        parts={[formatRead(post.read_minutes), formatDate(post.published_at)]}
      />

      <span className="mt-6 inline-flex items-center gap-2 text-[18px] text-foreground">
        להמשך קריאה
        <ArrowLeft
          className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
          aria-hidden="true"
        />
      </span>
    </div>
  </Link>
);

/**
 * Warm white between the hero and the charcoal cover story. Filtering lives
 * entirely in the drawer now, so nothing else stands between them, and the
 * hero's hairline must not run straight into the dark edge.
 *
 * Both the skeleton and the loaded page render it, so the cover story does not
 * jump down the page the moment the posts land.
 */
const HeroGap = () => <div className="h-8 md:h-12 bg-background" aria-hidden="true" />;

/** Layout stand-in while the table loads — same shapes, no copy to read. */
const MagazineSkeleton = () => (
  <>
    <span className="sr-only" role="status">
      טוען מאמרים…
    </span>
    <HeroGap />
    <section className="bg-foreground py-14 md:py-20" aria-hidden="true">
      <div className="container-luxury">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-center animate-pulse motion-reduce:animate-none">
          <div className="order-1 lg:col-span-7 aspect-[16/10] rounded-[14px] bg-background/10" />
          <div className="order-2 lg:col-span-5 space-y-4">
            <div className="h-5 w-24 rounded-[10px] bg-background/10" />
            <div className="h-8 w-4/5 rounded-[10px] bg-background/10" />
            <div className="h-5 w-full rounded-[10px] bg-background/10" />
            <div className="h-5 w-2/3 rounded-[10px] bg-background/10" />
          </div>
        </div>
      </div>
    </section>
    <section className="py-14 md:py-20 bg-background" aria-hidden="true">
      <div className="container-luxury">
        <div className="grid sm:grid-cols-2 gap-8 md:gap-10 animate-pulse motion-reduce:animate-none">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[4/3] rounded-[14px] bg-secondary" />
              <div className="h-6 w-3/4 rounded-[10px] bg-secondary" />
              <div className="h-5 w-full rounded-[10px] bg-secondary" />
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

/* ─────────────────────────── the page ─────────────────────────── */

type Block =
  | { kind: "spread"; key: string; posts: Post[] }
  | { kind: "band"; key: string; post: Post; flip: boolean };

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("blog_posts")
          .select("id, slug, title, excerpt, cover_image_url, tag, read_minutes, published_at")
          .eq("published", true)
          .order("published_at", { ascending: false });
        const rows = (data as Post[]) ?? [];
        if (cancelled) return;
        // Fall back to the placeholder magazine only when the table is empty
        // AND demo data is switched on — the page has nothing to lay out
        // otherwise, and no cover images at all. Real rows always win.
        if (import.meta.env.VITE_USE_DEMO_DATA === "1" && rows.length === 0) {
          const { demoPosts } = await import("@/data/demoBlog");
          setPosts(demoPosts as Post[]);
          return;
        }
        setPosts(rows);
      } catch {
        // A thrown query (offline, CORS) must still end the load, or the page
        // sits on the skeleton forever. Empty list → the "no posts yet" state.
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { value, setValue, activeCount } = useFilterParams(["topic"]);
  const selectedTopics = value.topic;

  const visible = useMemo(
    () =>
      selectedTopics.length
        ? posts.filter((p) => p.tag && selectedTopics.includes(p.tag))
        : posts,
    [posts, selectedTopics]
  );

  // Topic list for the drawer, counted off the posts themselves — a new tag in
  // the table shows up as a filter option without a code change.
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of posts) if (p.tag) counts.set(p.tag, (counts.get(p.tag) ?? 0) + 1);
    return Array.from(counts, ([value, count]) => ({ value, count })).sort((a, b) =>
      a.value.localeCompare(b.value, "he")
    );
  }, [posts]);

  const filterGroups: FilterGroup[] = useMemo(
    () => [
      {
        key: "topic",
        label: "נושא",
        options: topics.map((t) => ({ value: t.value, label: t.value, count: t.count })),
      },
    ],
    [topics]
  );

  /**
   * Blog schema for the index, matching how the other collection pages describe
   * themselves. Built from the full list rather than the filtered view — the
   * canonical /blog is the unfiltered magazine. Undefined until posts land, so
   * no empty graph is emitted on first paint.
   */
  const blogSchema = useMemo(() => {
    if (posts.length === 0) return undefined;
    return {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "המגזין של Aluma",
      description:
        "מאמרים על תרבות החוץ הישראלית, סלוני חוץ, בדים, אלומיניום ועקרונות תכנון של מרפסות וגגות יוקרה.",
      url: `${SITE}/blog`,
      inLanguage: "he-IL",
      publisher: { "@type": "Organization", name: "Aluma", url: SITE },
      blogPost: posts.map((p) => {
        const published = validDate(p.published_at);
        return {
          "@type": "BlogPosting",
          headline: p.title,
          url: `${SITE}/blog/${p.slug}`,
          ...(p.excerpt ? { description: p.excerpt } : {}),
          ...(p.cover_image_url?.startsWith("http") ? { image: p.cover_image_url } : {}),
          ...(published ? { datePublished: published.toISOString() } : {}),
          ...(p.tag ? { articleSection: p.tag } : {}),
          author: { "@type": "Organization", name: "Aluma" },
        };
      }),
    };
  }, [posts]);

  // Newest of whatever the filter left standing carries the cover.
  const lead = visible[0];

  /**
   * The run below the cover story alternates two-up spreads with single
   * full-width bands, so the page never settles into an even grid. A spread
   * left holding one post becomes a band instead — no half-empty row.
   */
  const blocks = useMemo(() => {
    const rest = visible.slice(1);
    const out: Block[] = [];
    let i = 0;
    let spreadTurn = true;
    let bands = 0;
    while (i < rest.length) {
      const slice = spreadTurn ? rest.slice(i, i + 2) : rest.slice(i, i + 1);
      if (slice.length === 2) {
        out.push({ kind: "spread", key: slice.map((p) => p.id).join("-"), posts: slice });
        i += 2;
      } else {
        // Every other band mirrors, counted over the bands themselves so an odd
        // tail can't break the zig-zag.
        out.push({ kind: "band", key: slice[0].id, post: slice[0], flip: bands++ % 2 === 1 });
        i += 1;
      }
      spreadTurn = !spreadTurn;
    }
    return out;
  }, [visible]);

  return (
    <Layout>
      <SEO
        title="מגזין Aluma | תרבות החוץ, עיצוב וחומרים"
        description="מאמרים על תרבות החוץ הישראלית, סלוני חוץ, בדים, אלומיניום ועקרונות תכנון של מרפסות וגגות יוקרה."
        path="/blog"
        jsonLd={blogSchema}
      />
      <PageHero
        title="המגזין"
        subtitle={
          <>
            כל מה שחדש בעיצוב החוץ: מגמות, חומרים ובדים, לצד השראה למרפסת, לגג ולחצר.
            <br />
            כאן אנחנו כותבים על מה שהופך מרחב פתוח לחלק מהבית.
          </>
        }
        filterSlot={
          <FilterSidebar
            groups={filterGroups}
            value={value}
            onChange={setValue}
            activeCount={activeCount}
            resultCount={visible.length}
          />
        }
      />

      {loading ? (
        <MagazineSkeleton />
      ) : posts.length === 0 ? (
        <section className="py-20 md:py-28 bg-background">
          <div className="container-luxury">
            <div className="max-w-xl mx-auto text-center">
              <img src={logo} alt="" aria-hidden="true" className="h-8 w-auto mx-auto opacity-30" />
              <p className="text-[20px] leading-relaxed text-foreground mt-7">
                עדיין אין מאמרים מפורסמים. חוזרים בקרוב עם תכנים חדשים.
              </p>
            </div>
          </div>
        </section>
      ) : visible.length === 0 || !lead ? (
        <section className="py-16 md:py-24 bg-background">
          <div className="container-luxury text-center">
            <p className="text-[20px] leading-relaxed text-foreground-soft">
              אין מאמרים בנושא שבחרתם.
            </p>
            <button
              type="button"
              onClick={() => setValue({ topic: [] })}
              className="mt-5 text-[18px] text-accent link-underline transition-smooth"
            >
              נקה את הסינון
            </button>
          </div>
        </section>
      ) : (
        <>
          <HeroGap />

          <CoverStory post={lead} />

          {blocks.length > 0 ? (
            <section className="py-14 md:py-20 bg-background">
              <div className="container-luxury">
                <Reveal className="mb-10 md:mb-14">
                  <SectionHeading align="start">עוד במגזין</SectionHeading>
                  <div className="w-20 h-[2px] bg-primary/55 mt-5" aria-hidden="true" />
                </Reveal>

                <div className="space-y-12 md:space-y-16">
                  {blocks.map((block) =>
                    block.kind === "spread" ? (
                      <div key={block.key} className="grid sm:grid-cols-2 gap-8 md:gap-10">
                        {block.posts.map((p, i) => (
                          <Reveal key={p.id} delay={i * 90}>
                            <HalfPage post={p} />
                          </Reveal>
                        ))}
                      </div>
                    ) : (
                      <Reveal key={block.key}>
                        <Band post={block.post} flip={block.flip} />
                      </Reveal>
                    )
                  )}
                </div>
              </div>
            </section>
          ) : (
            /* Only the cover story survived this view. The footer is the same
               charcoal as the spread, so without a warm-white band here the
               two dark blocks merge into one and the page loses its floor. */
            <section className="py-14 md:py-20 bg-background">
              <div className="container-luxury text-right">
                <p className="text-[20px] leading-relaxed text-foreground-soft">
                  {selectedTopics.length
                    ? "זו הכתבה היחידה בנושא שבחרתם."
                    : "זו הכתבה האחרונה שפורסמה במגזין."}
                </p>
                {selectedTopics.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setValue({ topic: [] })}
                    className="mt-5 text-[18px] text-accent link-underline transition-smooth"
                  >
                    להצגת כל הכתבות
                  </button>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </Layout>
  );
};

export default Blog;
