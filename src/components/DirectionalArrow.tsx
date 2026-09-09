import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { cn } from "@/lib/utils";

/**
 * An arrow that points the way the reader is going.
 *
 * The site was built in Hebrew, so "forward" was written as a left arrow
 * everywhere and hardcoded. On /en that reversed the meaning of every one of
 * them: "View project" pointed back towards the text, and the back link
 * pointed away from where it went — and their hover animations slid them the
 * wrong way too.
 *
 * The glyph is chosen by language; the hover motion uses `rtl:` variants, so
 * it always travels the same way relative to the label.
 */
const DirectionalArrow = ({
  direction = "forward",
  className,
  animate = true,
}: {
  direction?: "forward" | "back";
  className?: string;
  animate?: boolean;
}) => {
  const { lang } = useLocalizedPath();
  const forward = direction === "forward";
  // Forward is left in Hebrew and right in English; back is the opposite.
  const Icon = forward === (lang === "he") ? ArrowLeft : ArrowRight;

  return (
    <Icon
      aria-hidden="true"
      className={cn(
        "shrink-0",
        animate && "transition-transform duration-300 ease-out motion-reduce:transition-none",
        animate &&
          (forward
            ? "group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
            : "group-hover:-translate-x-1 rtl:group-hover:translate-x-1"),
        className,
      )}
    />
  );
};

export default DirectionalArrow;
