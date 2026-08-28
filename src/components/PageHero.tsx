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
        {/* Everything is right-aligned: the page is dir="rtl", so the title,
            its rule and the filter trigger all sit against the same edge. The
            trigger is stacked under the title rather than opposite it, so it
            stays on the right without crowding the heading — and on the same
            side as the drawer it opens.

            items-START, not items-end: in a column flex the cross axis is the
            INLINE axis, so under dir="rtl" `items-end` resolves to the LEFT
            edge. That one word used to push the title, its rule and the filter
            button to the wrong side of every interior page. */}
        <div className="flex flex-col items-start">
          {/* Shrink-to-fit, so the rule (w-full of this wrapper) measures
              exactly as wide as the title. A title too long for the row wraps
              and the rule follows it rather than overflowing the page. */}
          <div className="min-w-0 text-start">
            <h1
              className={`animate-rise-in font-display text-3xl sm:text-4xl md:text-5xl ${
                dark ? "text-background" : "text-foreground"
              }`}
            >
              {title}
            </h1>
            {/* Title-width, so it measures exactly as wide as the words and a
                wrapping title takes the rule with it. Colour comes from the
                shared accent token — same mark as the one under a centred
                SectionHeading, so the site has one rule vocabulary. */}
            <span
              className="block w-full h-px mt-4"
              style={{
                background: dark ? "var(--rule-accent-on-dark)" : "var(--rule-accent)",
              }}
              aria-hidden="true"
            />
          </div>

          {filterSlot && <div className="shrink-0 mt-5">{filterSlot}</div>}
        </div>

        {subtitle && (
          <p
            className={`text-body text-start mt-5 max-w-2xl ${
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
