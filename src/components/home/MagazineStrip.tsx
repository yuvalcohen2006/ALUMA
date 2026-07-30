import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ShineButton from "@/components/ui/shine-button";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/aluma-logo.png";

/**
 * Three newest articles, on the home screen.
 *
 * The magazine had ten pieces in it and the front page never once said so. This
 * is the smallest honest fix: the three most recent, in the same card grammar
 * the magazine itself uses, and a way through to the rest.
 *
 * Data mirrors src/pages/Blog.tsx exactly — same table, same published filter,
 * same newest-first order, same development fallback to the placeholder
 * magazine, same `?live=1` escape hatch. If there is nothing to show, the
 * section does not exist: no heading over an empty grid.
 */

const COUNT = 3;

type Post = {
  id: string;
  slug: string;
  title: string;
  cover_image_url: string | null;
  tag: string | null;
  read_minutes: number | null;
  published_at: string | null;
};

const hebrewDate = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Null unless the string parses as a real date — junk ISO never reaches the page. */
const formatDate = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : hebrewDate.format(d);
};

const formatRead = (minutes: number | null) => {
  if (!minutes || minutes < 1) return null;
  return minutes === 1 ? "דקת קריאה" : `${minutes} דקות קריאה`;
};

/**
 * Tag, read time, date — whatever survived the null checks, separated by
 * hairlines. Every one of those columns is nullable, so a post missing all
 * three leaves no empty row behind.
 */
const MetaLine = ({ post }: { post: Post }) => {
  const parts: ReactNode[] = [
    post.tag ? (
      <span key="tag" className="text-accent">
        {post.tag}
      </span>
    ) : null,
    formatRead(post.read_minutes),
    formatDate(post.published_at),
  ].filter((p): p is ReactNode => p !== null && p !== "");

  if (parts.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 text-meta text-muted-foreground">
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && (
            // shrink-0, or the hairline collapses to nothing once the row wraps
            // on a narrow screen.
            <span className="h-4 w-px shrink-0 bg-primary/45" aria-hidden="true" />
          )}
          {part}
        </Fragment>
      ))}
    </div>
  );
};

const Card = ({ post }: { post: Post }) => (
  <Link to={`/blog/${post.slug}`} className="group block min-w-0 text-right">
    <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] border border-border bg-secondary transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/60 group-hover:shadow-luxury">
      {post.cover_image_url ? (
        // The WRAPPER scales, never the <img> — zooming the image itself drags
        // the frame's border along with it.
        <div className="absolute inset-0 transition-transform duration-600 ease-out group-hover:scale-[1.06]">
          <img
            // Decorative: the title underneath is the link's accessible name,
            // so alt text here would only say it a second time.
            src={post.cover_image_url}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center">
          <img src={logo} alt="" aria-hidden="true" className="h-8 w-auto opacity-25" />
        </span>
      )}
    </div>

    {/* text-card-title, never the `text-card` alias: `card` is also a palette
        colour, so that class compiles to a white `color` as well as the 22px
        size and only a later colour utility keeps it visible. */}
    <h3 className="mt-5 font-display text-card-title leading-snug font-normal text-foreground transition-smooth group-hover:text-accent">
      {post.title}
    </h3>

    <MetaLine post={post} />
  </Link>
);

/**
 * Held while the table answers. It matches the loaded height closely enough
 * that the sections below it do not jump, and carries no copy to read.
 */
const StripSkeleton = () => (
  <div
    aria-hidden="true"
    className="grid animate-pulse gap-8 motion-reduce:animate-none md:grid-cols-3 md:gap-10"
  >
    {[0, 1, 2].map((i) => (
      <div key={i}>
        <div className="aspect-[16/10] rounded-[14px] bg-secondary" />
        <div className="mt-5 h-6 w-4/5 rounded-[10px] bg-secondary" />
        <div className="mt-3 h-5 w-2/3 rounded-[10px] bg-secondary" />
      </div>
    ))}
  </div>
);

const MagazineStrip = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("blog_posts")
          .select("id, slug, title, cover_image_url, tag, read_minutes, published_at")
          .eq("published", true)
          .order("published_at", { ascending: false })
          .limit(COUNT);
        const rows = (data as Post[]) ?? [];
        if (cancelled) return;
        // Same gate as the magazine page: the blog table is still empty, so in
        // development fall back to the placeholder articles rather than hide
        // the section during design. Real rows always win, production never
        // takes this path, and `?live=1` forces the database.
        const wantsLive =
          typeof window !== "undefined" &&
          new URLSearchParams(window.location.search).has("live");
        if (import.meta.env.DEV && !wantsLive && rows.length === 0) {
          const { demoPosts } = await import("@/data/demoBlog");
          if (!cancelled) setPosts((demoPosts as Post[]).slice(0, COUNT));
          return;
        }
        setPosts(rows);
      } catch {
        // A thrown query (offline, CORS) must still end the load, or the strip
        // sits on its skeleton forever. Empty list → the section disappears.
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing published: no heading, no empty grid, no section at all.
  if (!loading && posts.length === 0) return null;

  return (
    <section className="bg-background py-24 md:py-32">
      <div className="container-luxury">
        <Reveal className="mb-14 md:mb-16 flex flex-col items-center">
          <SectionHeading subtitle="מה שאנחנו כותבים על תרבות החוץ: חומרים, בדים ותכנון של מרפסות, גגות וחצרות.">
            מהמגזין
          </SectionHeading>
        </Reveal>

        {loading ? (
          <>
            <span className="sr-only" role="status">
              טוען כתבות…
            </span>
            <StripSkeleton />
          </>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-3 md:gap-10">
              {posts.map((post, i) => (
                <Reveal key={post.id} delay={i * 90}>
                  <Card post={post} />
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-14 flex justify-center md:mt-16">
              <ShineButton to="/blog">
                לכל הכתבות
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </ShineButton>
            </Reveal>
          </>
        )}
      </div>
    </section>
  );
};

export default MagazineStrip;
