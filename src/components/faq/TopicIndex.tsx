import { cn } from "@/lib/utils";

export interface TopicIndexEntry {
  /** DOM id of the group this line jumps to. */
  id: string;
  label: string;
  /** How many questions the group holds — the "page number" of the index line. */
  count: number;
}

interface TopicIndexProps {
  entries: TopicIndexEntry[];
  /** id of the group currently inside the reading band (scroll-spy). */
  activeId: string;
  onSelect: (id: string) => void;
  /** Quiet closing line under the index. Desktop only — see below. */
  footnote?: string;
  className?: string;
}

/** 1 → "01". The same folio device the projects index is built on. */
const folio = (n: number) => String(n).padStart(2, "0");

/**
 * The topic index of the Q&A page — set like the index at the back of a book
 * rather than as a navigation card.
 *
 * There is no panel: no border, no fill, no radius. What holds the block
 * together is typography — a terracotta hairline under the heading, a folio
 * numeral opening every line, a leader rule running from the topic out to its
 * question count, and a hairline closing each line. The active topic is marked
 * the way a printed index marks a live entry: the numeral warms from charcoal
 * to terracotta, the label goes to full charcoal, the leader warms, and a 2px
 * terracotta bar grows down the START edge (the right, in RTL) of its line.
 *
 * ONE layout at every width, deliberately. An earlier pass wrapped the lines
 * into a bare row of markers below lg; at 375px the three Hebrew labels do not
 * fit on one line, so the "row" collapsed into a ragged 4px-gap stack that read
 * as a bug rather than as a design. A full-width index line is also a far
 * better tap target than a 140px one. So the column stays a column, and only
 * its stickiness is desktop-only (set on the wrapper in FAQ.tsx).
 *
 * Folio colours follow the contents strip on Projects — charcoal ink at rest,
 * warming on hover/active. Terracotta at 60% on warm white measures under 2:1,
 * which is invisible at 20px however pretty it looks in the abstract.
 */
const TopicIndex = ({
  entries,
  activeId,
  onSelect,
  footnote,
  className,
}: TopicIndexProps) => (
  <div className={cn("text-right", className)}>
    <h2 className="font-display font-normal text-card-title leading-snug text-foreground">
      מפתח הנושאים
    </h2>

    {/* Full-width hairline rather than the 20px section stub: this is the rule
        an index hangs from, and it is what replaces the old panel's border. */}
    <div className="mt-4 h-px w-full bg-primary/35 lg:mt-5" aria-hidden="true" />

    <nav aria-label="ניווט בין נושאי השאלות" className="mt-1 flex flex-col">
      {entries.map((entry, i) => {
        const isActive = entry.id === activeId;
        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect(entry.id)}
            aria-current={isActive ? "location" : undefined}
            // The line reads "01 · topic · 3" on screen; spelled out here so it
            // is announced as a topic and a question count, not as loose digits.
            aria-label={`${entry.label}, ${entry.count} שאלות`}
            className="group relative flex w-full items-baseline gap-3 border-b border-border/70 py-4 ps-4 text-right"
          >
            {/* Active mark: a terracotta bar on the start edge — the right, in
                RTL — growing downward out of the line above it. Logical
                inset so it cannot end up on the wrong side. */}
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-y-0 start-0 w-[2px] origin-top bg-primary transition-transform duration-500 ease-out",
                isActive ? "scale-y-100" : "scale-y-0",
              )}
            />

            <span
              className={cn(
                "font-display text-lede leading-none tabular-nums transition-colors duration-300",
                isActive
                  ? "text-accent"
                  : "text-foreground/70 group-hover:text-foreground",
              )}
              aria-hidden="true"
            >
              {folio(i + 1)}
            </span>

            <span
              className={cn(
                "text-meta leading-snug transition-colors duration-300",
                isActive
                  ? "text-foreground"
                  : "text-foreground-soft group-hover:text-foreground",
              )}
            >
              {entry.label}
            </span>

            {/* Leader rule + count. Baseline-aligned, so the rule lands exactly
                on the text baseline and reads as a continuation of the line. */}
            <span
              aria-hidden="true"
              className={cn(
                "h-px flex-1 transition-colors duration-500",
                isActive ? "bg-primary/50" : "bg-border group-hover:bg-primary/30",
              )}
            />
            <span
              aria-hidden="true"
              className={cn(
                "text-meta tabular-nums transition-colors duration-300",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {entry.count}
            </span>
          </button>
        );
      })}
    </nav>

    {/* Desktop only. On a phone the index already sits directly above the
        answers, where a running total reads as filler between a visitor and
        the thing they came to read. */}
    {footnote && (
      <p className="mt-6 hidden text-meta leading-relaxed text-muted-foreground lg:block">
        {footnote}
      </p>
    )}
  </div>
);

export default TopicIndex;
