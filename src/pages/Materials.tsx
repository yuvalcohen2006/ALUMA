import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import { materials } from "@/data/materials";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { useSiteText } from "@/hooks/useSiteText";

/**
 * The materials, as narrative rather than as a spec sheet.
 *
 * The client asked for these to be "יותר יפים". The old version was four
 * bordered, shadowed cards in a grid — the same card the rest of the site
 * used, holding what is genuinely the most interesting content here.
 *
 * Tribù's model instead: one material per full-width block, alternating the
 * photograph left and right, with enough room for the material to be described
 * rather than listed. The photograph is large because a macro shot of weave or
 * grain is the argument. Nothing is boxed.
 *
 * This is the one page allowed to be slightly richer than the rest of the
 * site, and it earns that by being the page where the product is actually
 * explained.
 */
const MaterialsPage = () => {
  const { to } = useLocalizedPath();
  const text = useSiteText();

  return (
    <Layout>
      <SEO
        title="חומרים | Aluma"
        description="בדי Sunbrella, אלומיניום בציפוי אבקה, שיש גרניט פורצלן ו-PolyStone — מה כל חומר עושה בחוץ, ואיך הוא מזדקן."
        path="/materials"
      />

      <section className="bg-background">
        <div className="mx-auto max-w-[860px] px-6 pt-40 pb-16 md:pt-52 md:pb-24">
          <Reveal>
            <h1 className="text-start text-display font-normal tracking-normal text-foreground">
              {text("materials.title", "החומרים")}
            </h1>
            <p className="mt-6 max-w-[58ch] text-start text-body tracking-normal text-foreground-soft">
              {text(
                "materials.subtitle",
                "ההחלטה הראשונה בכל פריט היא לא הצורה, אלא החומר. אלה הארבעה שאנחנו בונים איתם, ומה כל אחד מהם עושה אחרי כמה שנים בחוץ.",
              )}
            </p>
          </Reveal>
        </div>
      </section>

      {materials.map((m, i) => (
        <section
          key={m.slug}
          className={i % 2 === 1 ? "bg-secondary" : "bg-background"}
        >
          <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16 py-20 md:py-28">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
              {/* The photograph alternates sides down the page. `order` moves
                  the children, so in RTL the first block still opens with its
                  image on the reading edge. */}
              <Reveal className={i % 2 === 1 ? "md:order-2" : ""}>
                <img
                  src={m.image}
                  alt={m.name}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full aspect-[3/2] object-cover"
                />
              </Reveal>

              <Reveal delay={80} className={i % 2 === 1 ? "md:order-1" : ""}>
                <div className="text-start">
                  <p className="text-label text-muted-foreground">{m.origin}</p>
                  <h2 className="mt-3 text-heading font-normal tracking-normal text-foreground">
                    {m.name}
                  </h2>
                  <p className="mt-4 max-w-[52ch] text-body tracking-normal text-foreground-soft">
                    {m.longDesc[0]}
                  </p>

                  {/* Two qualities, not four. The rest live on the material's
                      own page — this block is an introduction, not a summary
                      of everything. */}
                  <dl className="mt-8 space-y-4 max-w-[52ch]">
                    {m.features.slice(0, 2).map((f) => (
                      <div key={f.title}>
                        <dt className="text-small text-foreground">{f.title}</dt>
                        <dd className="mt-0.5 text-small text-muted-foreground">{f.desc}</dd>
                      </div>
                    ))}
                  </dl>

                  <Link
                    to={to(`/materials/${m.slug}`)}
                    className="mt-8 inline-block text-small text-foreground underline underline-offset-[6px] decoration-1 hover:text-accent transition-colors"
                  >
                    עוד על {m.name}
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      ))}
    </Layout>
  );
};

export default MaterialsPage;
