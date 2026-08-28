import { Fragment, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import DOMPurify from "dompurify";
import logo from "@/assets/aluma-logo.png";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  tag: string | null;
  read_minutes: number | null;
  published_at: string | null;
};

/* ─────────────────────────── masthead meta ───────────────────────────
   Same helpers, wording and null handling as the magazine index, so a card
   that promises "5 דקות קריאה" opens onto an article that says the same. */

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

/* ─────────────────────────── article body ───────────────────────────
   The post arrives as sanitised HTML from the CMS, so every tag it can emit
   has to be styled from here. @tailwindcss/typography is installed but is NOT
   registered in tailwind.config.ts, which means `prose`/`prose-lg` resolve to
   nothing — under preflight that left h3, a, ol and blockquote visually
   identical to plain running text. These rules replace it:

     h2 26 bold · h3 22 · h4 20 · running text 18/1.75 (.text-body)
     everything else — list items, captions, cells — at the 18px floor. */
const ARTICLE_BODY = [
  // break-words: a pasted URL is the one thing in CMS copy long enough to push
  // the 375px viewport into horizontal scroll.
"max-w-none text-start text-foreground text-body break-words",

  // Headings — the site's section/card scale, not the browser's. h1 is mapped
  // too: the page already owns the real h1, but authors paste them in, and an
  // unmapped one renders at preflight's `font-size: inherit`, i.e. body copy.
"[&_h1]:font-display [&_h1]:font-medium [&_h1]:text-heading [&_h1]:leading-snug [&_h1]:text-primary [&_h1]:mt-12 [&_h1]:mb-4",
"[&_h2]:font-display [&_h2]:font-medium [&_h2]:text-heading [&_h2]:leading-snug [&_h2]:text-primary [&_h2]:mt-12 [&_h2]:mb-4",
"[&_h3]:font-display [&_h3]:font-normal [&_h3]:text-body [&_h3]:leading-snug [&_h3]:text-foreground [&_h3]:mt-10 [&_h3]:mb-3",
"[&_h4]:font-display [&_h4]:font-normal [&_h4]:text-body [&_h4]:leading-snug [&_h4]:text-foreground [&_h4]:mt-8 [&_h4]:mb-3",

  // Running text.
"[&_p]:mb-6 [&_p]:text-pretty",

  // Lists. Preflight strips markers and padding from ul/ol, so both come back
  // explicitly; ps-6 is logical, so the bullets sit on the right in RTL.
"[&_ul]:mb-6 [&_ul]:ps-6 [&_ul]:list-disc",
"[&_ol]:mb-6 [&_ol]:ps-6 [&_ol]:list-decimal",
"[&_li]:mb-2 [&_li]:text-body",
"[&_li::marker]:text-primary/70",

  // Links inside the copy — terracotta on warm white, underline kept.
"[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-accent/40 [&_a]:transition-smooth",
"[&_a:hover]:decoration-accent",
"[&_strong]:font-medium [&_strong]:text-foreground",

  // Preflight leaves <small> alone, so the browser default (`font-size: smaller`,
  // ~14px) survives — the exact kind of small weird text the pass exists to kill.
"[&_small]:text-body",

  // Pull quote — rule on the start (right) edge.
"[&_blockquote]:my-8 [&_blockquote]:border-s-2 [&_blockquote]:border-foreground/15 [&_blockquote]:ps-6",
"[&_blockquote]:text-body [&_blockquote]:leading-relaxed [&_blockquote]:text-foreground-soft",

  // Media and rules.
"[&_img]:w-full [&_img]:rounded-sm [&_img]:my-8",
"[&_figcaption]:mt-3 [&_figcaption]:text-body [&_figcaption]:text-muted-foreground",
"[&_hr]:my-10 [&_hr]:border-border",

  // Tables are rare in the CMS but arrive completely bare when they do.
"[&_table]:w-full [&_table]:my-8 [&_table]:text-body",
"[&_th]:py-3 [&_th]:text-start [&_th]:font-normal [&_th]:text-foreground",
"[&_td]:py-3 [&_td]:text-start [&_td]:border-b [&_td]:border-border",

  // The first block sits right under the cover photo and the last one right
  // above the page floor — neither needs its own margin on top of that.
"[&>:first-child]:mt-0 [&>:last-child]:mb-0",
].join(" ");

/** Layout stand-in while the row loads — same shapes as the article, no copy to read. */
const ArticleSkeleton = () => (
  <div className="container-luxury max-w-3xl">
    <span className="sr-only" role="status">
      טוען מאמר…
    </span>
    <div className="animate-pulse motion-reduce:animate-none" aria-hidden="true">
      <div className="h-5 w-32 rounded-sm bg-secondary" />
      <div className="h-10 w-4/5 rounded-sm bg-secondary mx-auto mt-12" />
      <div className="h-10 w-3/5 rounded-sm bg-secondary mx-auto mt-4" />
      <div className="aspect-[16/9] rounded-sm bg-secondary mt-10" />
      <div className="h-5 w-full rounded-sm bg-secondary mt-10" />
      <div className="h-5 w-11/12 rounded-sm bg-secondary mt-4" />
      <div className="h-5 w-4/5 rounded-sm bg-secondary mt-4" />
    </div>
  </div>
);

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      setPost(data as Post | null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <article className="pt-32 md:pt-40 pb-20 min-h-[60vh]" aria-busy="true">
          <ArticleSkeleton />
        </article>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <section className="pt-40 pb-20 bg-background">
          <div className="container-luxury max-w-3xl text-center">
            <p className="text-body leading-relaxed text-foreground mb-6">המאמר לא נמצא.</p>
            <button
              type="button"
              onClick={() => nav("/blog")}
              className="text-body text-accent link-underline transition-smooth"
            >
              חזרה למגזין
            </button>
          </div>
        </section>
      </Layout>
    );
  }

  // Whatever survived the null checks, separated by hairlines. Renders nothing
  // at all when a post carries no tag, no read time and no date.
  const meta = [post.tag, formatRead(post.read_minutes), formatDate(post.published_at)].filter(
    (part): part is string => Boolean(part)
  );

  return (
    <Layout>
      <SEO
        title={`${post.title} | מגזין Aluma`}
        description={post.excerpt ?? post.title}
        path={`/blog/${post.slug}`}
        image={post.cover_image_url ?? undefined}
      />
      <article className="pt-32 md:pt-40 pb-20">
        <div className="container-luxury max-w-3xl">
          {/* Back, not forward: in RTL the return arrow points right. */}
          <Link
            to="/blog"
            className="group inline-flex items-center gap-2 text-body text-foreground-soft hover:text-primary transition-smooth mb-10"
          >
            <ArrowRight
              className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
            חזרה למגזין
          </Link>
          <div className="flex justify-center mb-2">
            <img src={logo} alt="Aluma" className="h-7 md:h-8 w-auto object-contain opacity-70" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground mt-3 mb-5 leading-tight text-center">
            {post.title}
          </h1>
          <div className="w-20 h-[2px] bg-foreground/15 mx-auto mt-2" aria-hidden="true" />
          {meta.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 text-body text-muted-foreground mt-5">
              {meta.map((part, i) => (
                <Fragment key={part}>
                  {/* shrink-0: without it the hairline collapses to nothing once
                      the row wraps on a narrow screen. */}
                  {i > 0 && <span className="w-px h-4 shrink-0 bg-foreground/15" aria-hidden="true" />}
                  <span>{part}</span>
                </Fragment>
              ))}
            </div>
          )}
          {post.cover_image_url && (
            <div className="aspect-[16/9] overflow-hidden rounded-sm border border-border  mt-10 mb-10 bg-secondary">
              <img src={post.cover_image_url} alt={post.title} loading="eager" decoding="async" fetchPriority="high" width={1600} height={900} className="w-full h-full object-cover" />
            </div>
          )}
          <div
            className={`${ARTICLE_BODY} mt-10`}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                /<\/?[a-z][\s\S]*>/i.test(post.content)
                  ? post.content
                  : post.content
                      .split(/\n{2,}/)
                      .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
                      .join("")
              ),
            }}
          />
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
