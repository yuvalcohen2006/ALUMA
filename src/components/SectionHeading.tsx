import type { ReactNode } from "react";

interface SectionHeadingProps {
  /** The title text. */
  children: ReactNode;
  /** Optional running text shown under the title (with a cream divider between). */
  subtitle?: ReactNode;
  /** White title/text for dark sections (e.g. the materials rail). */
  light?: boolean;
  /** Horizontal alignment. */
  align?: "center" | "start";
  as?: "h2" | "h3";
  className?: string;
}

// Shared home-screen heading: terracotta (or white) 24px bold Heebo title,
// cream divider, 18px normal Assistant running text.
const SectionHeading = ({
  children,
  subtitle,
  light = false,
  align = "center",
  as: Tag = "h2",
  className = "",
}: SectionHeadingProps) => {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-right";
  return (
    <div className={`flex flex-col ${alignCls} ${className}`}>
      <Tag
        className={`font-display font-bold text-2xl leading-snug ${light ? "text-background" : "text-primary"}`}
      >
        {children}
      </Tag>
      {subtitle != null && subtitle !== "" && (
        <>
          <div
            className={`w-12 h-px my-4 ${light ? "bg-background/25" : "bg-cream"}`}
            aria-hidden="true"
          />
          <p
            className={`text-lg font-normal leading-relaxed max-w-2xl ${
              light ? "text-background/75" : "text-foreground"
            }`}
          >
            {subtitle}
          </p>
        </>
      )}
    </div>
  );
};

export default SectionHeading;
