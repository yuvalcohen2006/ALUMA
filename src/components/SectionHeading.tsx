import type { ReactNode } from "react";

interface SectionHeadingProps {
  /** The title text. */
  children: ReactNode;
  /** Optional running text shown under the title (with a cream divider between). */
  subtitle?: ReactNode;
  /** White title/text for dark sections (e.g. the materials rail). */
  light?: boolean;
  /**
   * Title colour on light backgrounds. Terracotta only carries enough contrast on
   * warm-white — any title sitting on sand beige must use "charcoal".
   */
  tone?: "primary" | "charcoal";
  /** Set false to drop the rule between the title and its subtitle. */
  divider?: boolean;
  /** Horizontal alignment. */
  align?: "center" | "start";
  as?: "h2" | "h3";
  className?: string;
}

// Shared section heading: terracotta (or white) 30px bold Heebo title,
// cream divider, 20px normal running text.
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
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-right";
  const titleColor = light
    ? "text-background"
    : tone === "charcoal"
      ? "text-foreground"
      : "text-primary";
  return (
    <div className={`flex flex-col ${alignCls} ${className}`}>
      <Tag className={`font-display font-bold text-[38px] leading-snug ${titleColor}`}>
        {children}
      </Tag>
      {subtitle != null && subtitle !== "" && (
        <>
          {divider && (
            <div
              className={`w-20 h-[2px] my-5 ${light ? "bg-background/40" : "bg-primary/55"}`}
              aria-hidden="true"
            />
          )}
          <p
            className={`text-[20px] font-normal leading-relaxed max-w-2xl text-pretty ${
              // With the rule gone the subtitle would sit right under the title,
              // so it carries the gap itself.
              divider ? "" : "mt-7"
            } ${light ? "text-background/75" : "text-foreground"}`}
          >
            {subtitle}
          </p>
        </>
      )}
    </div>
  );
};

export default SectionHeading;
