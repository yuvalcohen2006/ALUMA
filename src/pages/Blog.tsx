import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionLabel from "@/components/SectionLabel";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/aluma-logo.png";

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

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, cover_image_url, tag, read_minutes, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false });
      setPosts((data as Post[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <Layout>
      <SEO
        title="מגזין Aluma | תרבות החוץ, עיצוב וחומרים"
        description="מאמרים על תרבות החוץ הישראלית, סלוני חוץ, בדים, אלומיניום ועקרונות תכנון של מרפסות וגגות יוקרה."
        path="/blog"
      />
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 gradient-cream">
        <div className="container-luxury text-center">
          <SectionLabel he="המגזין" en="Magazine" className="text-xs mb-5" />
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-primary mb-4">סיפורים, חומרים והשראה</h1>
          <p className="text-primary/70 max-w-2xl mx-auto">
            מאמרי עומק על תכנון חללי חוץ, בחירת בדים, אלומיניום בגזרה ישראלית, ועקרונות הסטיילינג של Aluma.
          </p>
          <div className="w-16 h-px bg-primary/30 mx-auto mt-8" />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="w-full px-3 md:px-4">
          {loading ? (
            <div className="text-primary/60 text-center">טוען...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-primary/60">
              עדיין אין מאמרים מפורסמים. חוזרים בקרוב עם תכנים חדשים.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="group block bg-background border border-border rounded-sm overflow-hidden shadow-soft hover:shadow-luxury transition-smooth"
                >
                  {p.cover_image_url && (
                    <div className="aspect-[4/3] overflow-hidden bg-secondary/40">
                      <img
                        src={p.cover_image_url}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6 text-center">
                    <div className="flex justify-center">
                      <img src={logo} alt="Aluma" className="h-4 w-auto object-contain opacity-80" />
                    </div>
                    <h2 className="font-display text-xl text-primary mt-2 mb-3 group-hover:text-accent transition-smooth text-center">
                      {p.title}
                    </h2>
                    {p.excerpt && <p className="text-sm text-primary/70 line-clamp-3 text-center">{p.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
