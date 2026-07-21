import type { ReactNode } from "react";

interface SectionLabelProps {
  he: ReactNode;
  en: ReactNode;
  as?: "div" | "h2";
  className?: string;
}

const SectionLabel = ({ he, en, as: Tag = "div", className = "" }: SectionLabelProps) => {
  return (
    <Tag
      className={`flex items-center justify-center gap-3 tracking-[0.4em] uppercase text-primary/70 ${className}`}
    >
      <span>{he}</span>
      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" aria-hidden="true" />
      <span className="text-xs md:text-sm tracking-[0.25em] normal-case font-semibold text-primary/80">
        {en}
      </span>
    </Tag>
  );
};

export default SectionLabel;
