import type { ReactNode } from "react";

interface PageHeroProps {
  title: ReactNode;
  /** One quiet line under the divider. */
  subtitle?: ReactNode;
  /** Filter trigger, pinned to the edge opposite the title. */
  filterSlot?: ReactNode;
  /**
   * Charcoal band with a white title, for pages that run dark end to end —
   * the same inversion the materials rail uses on the home screen.
   */
  dark?: boolean;
}

/**
 * Shared top band for every interior page.
 *
 * Lifted wholesale from the Our Story page: no sand slab, no decoration — the
 * page just opens on the background it lives on, with the title set right
 * against the container edge and a hairline under it that measures exactly as
 * wide as the words. Title carries its presence through size, not weight or
 * ornament. Header.tsx forces its border off the home page since there's no
 * band left anywhere to separate it from the page.
 */
const PageHero = ({ title, subtitle, filterSlot, dark = false }: PageHeroProps) => {
  return (
    <section className={`pt-[127px] pb-4 md:pb-6 ${dark ? "bg-foreground" : "bg-background"}`}>
      <div className="container-luxury">
        {/* The page is dir="rtl", so the first flex child sits at the RIGHT
            edge — title first, filter button pushed to the far left. */}
        <div className="flex items-end justify-between gap-6">
          {/* Shrink-to-fit, so the divider (w-full of this wrapper) measures
              exactly as wide as the title. A title too long for the row wraps
              and the divider follows it rather than overflowing the page. */}
          <div className="min-w-0 text-right">
            <h1
              className={`animate-rise-in font-display text-3xl sm:text-4xl md:text-5xl ${
                dark ? "text-background" : "text-primary"
              }`}
            >
              {title}
            </h1>
            <span
              className={`block w-full h-px mt-4 ${dark ? "bg-background/40" : "bg-primary/50"}`}
              aria-hidden="true"
            />
          </div>

          {filterSlot && <div className="shrink-0">{filterSlot}</div>}
        </div>

        {subtitle && (
          <p
            className={`text-body text-right mt-5 max-w-2xl ${
              dark ? "text-background/75" : "text-foreground-soft"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
};

export default PageHero;
