import type { ReactNode } from "react";

interface SectionLabelProps {
  he: ReactNode;
  /** English label — no longer rendered (kept so existing call sites don't break). */
  en?: ReactNode;
  as?: "div" | "h2";
  className?: string;
}

// Hebrew-only eyebrow. No English label, no decorative dot — just a clean, tracked label.
const SectionLabel = ({ he, as: Tag = "div", className = "" }: SectionLabelProps) => {
  return (
    <Tag
      className={`inline-flex items-center tracking-[0.35em] uppercase font-medium text-primary ${className}`}
    >
      {he}
    </Tag>
  );
};

export default SectionLabel;
