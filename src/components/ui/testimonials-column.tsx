import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { brandAvatar, type Testimonial } from "@/data/testimonials";

interface TestimonialsColumnProps {
  testimonials: Testimonial[];
  /** Seconds for one full loop. Different values per column keep them out of sync. */
  duration?: number;
  className?: string;
}

// Five stars, filled up to `rating` in terracotta, the rest as faint outlines.
const Stars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5" aria-label={`דירוג ${rating} מתוך 5`}>
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "fill-primary text-primary" : "fill-transparent text-primary/25",
        )}
        strokeWidth={1.5}
        aria-hidden="true"
      />
    ))}
  </div>
);

const Avatar = ({ t }: { t: Testimonial }) =>
  t.brand ? (
    <img
      src={brandAvatar}
      alt="Aluma"
      width={40}
      height={40}
      loading="lazy"
      className="h-10 w-10 rounded-full object-cover ring-1 ring-primary/25 bg-secondary"
    />
  ) : (
    <div
      aria-hidden="true"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-primary font-medium text-meta"
    >
      {t.initials}
    </div>
  );

const Card = ({ t }: { t: Testimonial }) => (
  <div className="w-full max-w-xs rounded-[14px] border border-border/70 bg-card p-6 md:p-7 shadow-soft">
    <Stars rating={t.rating} />
    <p className="mt-3 text-meta leading-relaxed text-foreground text-pretty">{t.text}</p>
    <div className="mt-5 flex items-center gap-3">
      <Avatar t={t} />
      <div className="flex flex-col">
        <span className="font-medium leading-5 text-foreground">{t.name}</span>
        <span className="text-meta text-muted-foreground">{t.role}</span>
      </div>
    </div>
  </div>
);

/**
 * A single vertically-scrolling column of testimonial cards. The list is rendered
 * twice and translated up by 50% on a linear loop, so the seam is invisible.
 * Under prefers-reduced-motion the column is static.
 */
export const TestimonialsColumn = ({ testimonials, duration = 24, className }: TestimonialsColumnProps) => {
  const reduce = useReducedMotion();
  return (
    <div className={className}>
      <motion.div
        animate={reduce ? undefined : { translateY: "-50%" }}
        transition={
          reduce ? undefined : { duration, repeat: Infinity, ease: "linear", repeatType: "loop" }
        }
        className="flex flex-col gap-6 pb-6"
      >
        {[0, 1].map((dup) => (
          <Fragment key={dup}>
            {testimonials.map((t, i) => (
              <Card key={`${dup}-${i}`} t={t} />
            ))}
          </Fragment>
        ))}
      </motion.div>
    </div>
  );
};

export default TestimonialsColumn;
