import type { ReactNode } from "react";
import SectionRule from "./SectionRule";

interface SectionHeadingProps {
  /** The title text. */
  children: ReactNode;
  /** Optional running text shown under the rule. */
  subtitle?: ReactNode;
  /** White title/text for dark sections (e.g. the materials rail). */
  light?: boolean;
  /**
   * Title colour on light backgrounds. Terracotta only carries enough contrast on
   * warm-white — any title sitting on sand beige must use "charcoal".
   */
  tone?: "primary" | "charcoal";
  /** Escape hatch: drop the rule entirely for a heading that shouldn't carry one. */
  divider?: boolean;
  /** Horizontal alignment. */
  align?: "center" | "start";
  as?: "h2" | "h3";
  className?: string;
}

/**
 * Shared section heading: title, rule, optional running text.
 *
 * The rule is drawn by SectionRule and now appears under EVERY heading, not
 * only the ones that happen to have a subtitle — which is why most of the home
 * page used to show no rule at all.
 *
 * Which rule you get follows the heading rather than being chosen per call
 * site, so the site can't drift back into a mix of bar styles:
 *   centred heading      → short 48×1px accent mark
 *   start-aligned heading → full-width hairline
 * and the surface is inferred from the colour props (`light` = charcoal
 * section, `tone="charcoal"` = sand section, otherwise warm white).
 */
const SectionHeading = ({
  children,
  subtitle,
  light = false,
  divider = true,
  tone = "primary",
  align = "center",
  as: Tag = "h2",
  className = "",
}: SectionHeadingProps) => {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-start";
  const titleColor = light
    ? "text-background"
    : tone === "charcoal"
      ? "text-foreground"
      : "text-primary";

  const surface = light ? "dark" : tone === "charcoal" ? "tinted" : "light";
  const hasSubtitle = subtitle != null && subtitle !== "";

  return (
    <div className={`flex flex-col ${alignCls} ${className}`}>
      <Tag className={`font-display font-bold text-[38px] leading-snug ${titleColor}`}>
        {children}
      </Tag>

      {divider && (
        <SectionRule
          on={surface}
          variant={align === "center" ? "accent" : "hairline"}
          align={align}
          // A heading that ends here doesn't need the rule's full bottom margin
          // as well as the section's own padding.
          className={hasSubtitle ? "" : "mb-0"}
        />
      )}

      {hasSubtitle && (
        <p
          className={`text-[20px] font-normal leading-relaxed max-w-2xl text-pretty ${
            // Without a rule the subtitle would sit right under the title, so it
            // carries the gap itself.
            divider ? "" : "mt-7"
          } ${light ? "text-background/75" : "text-foreground"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
