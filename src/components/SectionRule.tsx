/**
 * The site's ONE divider. Every rule under a section title comes from here.
 *
 * Before this existed the site mixed 80×2px terracotta bars, full-width
 * hairlines at three different opacities, and sections with no rule at all —
 * which is the fastest way for a page to read as un-designed.
 *
 * Two variants, and that is deliberately all:
 *
 * - `hairline` — a 1px rule the full width of its container. The default, and
 *   what start-aligned headings use.
 * - `accent` — a short 48×1px mark in the brand colour, for centred titles.
 *   48px because a longer bar stops reading as a mark and starts reading as a
 *   broken rule; 1px because 2–4px accent bars are the theme-template tell.
 *
 * `on` names the BACKGROUND the rule sits on, not the rule's own colour. The
 * opacities are tuned per surface: below ~0.08 a hairline vanishes on cheap
 * panels, and above ~0.14 on a light surface it starts to look like a table
 * border.
 *
 * `border-block-end` / logical margins throughout, so there is nothing to flip
 * for RTL.
 */
interface SectionRuleProps {
  /** The surface this rule sits on. Decides the rule's opacity. */
  on?: "light" | "tinted" | "dark";
  variant?: "hairline" | "accent";
  /** Only meaningful for `accent` — a hairline always spans its container. */
  align?: "center" | "start";
  className?: string;
}

const RULE_COLOR: Record<NonNullable<SectionRuleProps["on"]>, string> = {
  light: "var(--rule-on-light)",
  tinted: "var(--rule-on-tinted)",
  dark: "var(--rule-on-dark)",
};

const SectionRule = ({
  on = "light",
  variant = "hairline",
  align = "center",
  className = "",
}: SectionRuleProps) => {
  if (variant === "accent") {
    return (
      <span
        aria-hidden="true"
        className={`block h-px w-12 mt-5 mb-8 ${
          align === "center" ? "mx-auto" : "ms-0 me-auto"
        } ${className}`}
        style={{
          background: on === "dark" ? "var(--rule-accent-on-dark)" : "var(--rule-accent)",
        }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`block w-full h-px mt-[18px] mb-7 md:mb-12 ${className}`}
      style={{ background: RULE_COLOR[on] }}
    />
  );
};

export default SectionRule;
