import { useEffect, useState } from "react";
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
        <div className="min-h-[60vh]" aria-hidden />
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <section className="pt-40 pb-20 text-center">
          <p className="text-foreground mb-6">המאמר לא נמצא.</p>
          <button onClick={() => nav("/blog")} className="text-primary underline">
            חזרה למגזין
          </button>
        </section>
      </Layout>
    );
  }

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
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-primary/60 hover:text-primary mb-8">
            <ArrowRight className="h-4 w-4" />
            חזרה למגזין
          </Link>
          <div className="flex justify-center mb-2">
            <img src={logo} alt="Aluma" className="h-4 w-auto object-contain opacity-80" />
          </div>
          <h1 className="font-display text-3xl md:text-5xl text-primary mt-3 mb-5 leading-tight text-center">
            {post.title}
          </h1>
          {post.cover_image_url && (
            <div className="aspect-[16/9] overflow-hidden rounded-sm mb-10 bg-secondary/40">
              <img src={post.cover_image_url} alt={post.title} loading="eager" decoding="async" fetchPriority="high" width={1600} height={900} className="w-full h-full object-cover" />
            </div>
          )}
          <div
            className="prose prose-lg max-w-none text-center text-foreground leading-relaxed [&>h2]:font-display [&>h2]:text-2xl [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:text-primary [&>h2]:text-center [&>h3]:text-center [&>p]:mb-5 [&>p]:text-center [&>ul]:list-none [&>ul]:p-0 [&>ul]:mb-5 [&>ul>li]:mb-2 [&>ul>li]:text-center"
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
