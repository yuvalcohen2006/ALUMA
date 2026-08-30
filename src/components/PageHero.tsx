import type { ReactNode } from "react";

interface PageHeroProps {
  title: ReactNode;
  /** One quiet line under the title. */
  subtitle?: ReactNode;
  /** Filter trigger, stacked under the title on the same edge. */
  filterSlot?: ReactNode;
  /**
   * Charcoal band with a white title, for pages that run dark end to end —
   * the same inversion the materials rail uses on the home screen.
   */
  dark?: boolean;
}

/**
 * The top of every interior page.
 *
 * No slab, no photograph, no rule: the page opens on its own background with
 * the title set against the container edge, and the space under it does the
 * separating. This is the shape the About, Q&A and materials pages already
 * had; those three looked settled and everything using this component did not,
 * which was the whole difference.
 *
 * Sizes come from the five-role scale rather than raw Tailwind steps. A header
 * hand-set to `text-5xl` drifts from the display role the moment either
 * changes, and drifted headers are most of what "inconsistent" means.
 *
 * `pt` clears the fixed header (~96px) and then adds the page's own opening
 * space; Header.tsx drops its border on pages that open like this.
 */
const PageHero = ({ title, subtitle, filterSlot, dark = false }: PageHeroProps) => (
  <section
    className={`pt-36 pb-14 md:pt-44 md:pb-20 ${dark ? "bg-foreground" : "bg-background"}`}
  >
    <div className="container-luxury">
      {/* items-START, not items-end: in a column flex the cross axis is the
          INLINE axis, so under dir="rtl" `items-end` resolves to the LEFT
          edge. That one word used to push the title and the filter button to
          the wrong side of every interior page. */}
      <div className="flex flex-col items-start">
        <h1
          className={`text-start text-display font-normal tracking-normal ${
            dark ? "text-background" : "text-foreground"
          }`}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className={`mt-6 max-w-[58ch] text-start text-body leading-relaxed ${
              dark ? "text-background/75" : "text-foreground-soft"
            }`}
          >
            {subtitle}
          </p>
        )}

        {filterSlot && <div className="mt-8 shrink-0">{filterSlot}</div>}
      </div>
    </div>
  </section>
);

export default PageHero;
