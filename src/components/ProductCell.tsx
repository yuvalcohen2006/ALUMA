import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import FavoriteButton from "@/components/FavoriteButton";
import type { DBProduct } from "@/hooks/useCollectionsData";

export type ProductCellProps = {
  product: DBProduct;
  index: number;
  lead: boolean;
  eager: boolean;
};

/**
 * One product. No card panel — a framed photograph sitting on the page
 * background, with the caption aligned to the photo's right edge.
 *
 * `lead` gives the first product of a collection `col-span-2` below sm, so on a
 * 375px phone every collection opens on a real 335×251 photograph and the rest
 * scan 2-up. At sm and above every cell is already ≥284px, so the span is
 * released.
 */
const ProductCell = ({ product: p, index, lead, eager }: ProductCellProps) => {
  const meta = [p.tag, p.dimensions].filter(Boolean) as string[];

  return (
    // Delay cascades from the right — index 0 is the rightmost child in RTL —
    // so the reveal runs in reading order.
    <Reveal
      delay={(index % 3) * 80}
      className={`min-w-0 ${lead ? "col-span-2 sm:col-span-1" : ""}`}
    >
      {/* `group` on the wrapper, not the Link, so the FavoriteButton is a
          sibling of the anchor and hovering the caption still lifts the photo. */}
      <div className="group relative">
        <Link to={`/collections/${p.slug}`} className="block text-right">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-secondary border border-border transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-luxury group-hover:border-primary/60">
            {/* Zoom on the wrapper, never the <img> — scaling the image drags
                the border and the radius with it in some engines. Same
                construction as the approved Projects entry. */}
            <div className="absolute inset-0 transition-transform duration-600 ease-out group-hover:scale-[1.06]">
              {p.cover_url && (
                <img
                  src={p.cover_url}
                  alt={[p.name, p.tag].filter(Boolean).join(", ") + " | Aluma"}
                  width={1024}
                  height={768}
                  loading={eager ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          <h3 className="mt-4 font-display font-normal text-[22px] leading-snug text-foreground transition-colors duration-300 group-hover:text-accent">
            {p.name}
          </h3>

          {p.tagline && (
            <p className="mt-1.5 text-[18px] leading-relaxed text-muted-foreground text-pretty">
              {p.tagline}
            </p>
          )}

          {/* The tag used to be an opaque chip floating on the photograph, 20×
              per page. It is ink on the page now, next to the dimensions.
              `hidden sm:flex`: at 159px the tag + dimensions + rule wrap to two
              18px lines under a 120px photo — caption taller than the plate —
              and the 18px floor forbids shrinking them. Each rule travels
              INSIDE the item it follows, so a wrap can only ever leave a rule
              at the left margin. */}
          {meta.length > 0 && (
            <div className="mt-2 hidden sm:flex flex-wrap items-center gap-y-1 text-[18px] text-muted-foreground">
              {meta.map((m, j) => (
                <span key={`${j}-${m}`} className="inline-flex items-center whitespace-nowrap">
                  {m}
                  {j < meta.length - 1 && (
                    <span aria-hidden="true" className="w-px h-4 bg-primary/45 shrink-0 mx-3" />
                  )}
                </span>
              ))}
            </div>
          )}
        </Link>

        {/* `size="sm"` (32px): the default 40px is 34% of a 119px mobile photo.
            `left-3` is physical on purpose — this is a positioned overlay, not
            flow content, so it must not become a logical property. */}
        <FavoriteButton
          productId={p.id}
          collectionSlug={p.slug}
          size="sm"
          className="absolute top-3 left-3 z-10"
        />
      </div>
    </Reveal>
  );
};

export default ProductCell;
