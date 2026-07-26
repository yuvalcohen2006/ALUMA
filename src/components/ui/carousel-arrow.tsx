import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselArrowProps {
  /** Visual direction of the chevron. In RTL "next" points left, "prev" points right. */
  direction: "prev" | "next";
  onClick: () => void;
  /** Light ink for the charcoal materials rail. */
  invert?: boolean;
  className?: string;
}

/**
 * Borderless box arrow: transparent at rest, soft grey wash + darker chevron on
 * hover. Shared by the projects carousel and the materials rail so both read the same.
 */
const CarouselArrow = ({ direction, onClick, invert = false, className }: CarouselArrowProps) => {
  const Icon = direction === "next" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "next" ? "הבא" : "הקודם"}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-[10px] border-0 transition-colors duration-300",
        invert
          ? "text-background/55 hover:bg-background/10 hover:text-background"
          : "text-foreground/45 hover:bg-foreground/[0.07] hover:text-foreground",
        className,
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} />
    </button>
  );
};

export default CarouselArrow;
