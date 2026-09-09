import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      // border, not just fill: the track is #F8F8F8 on a white card, 1.07:1,
      // so at 0% there was no bar on the screen at all — the one state every
      // new project starts in.
      "relative h-4 w-full overflow-hidden rounded-full border border-border bg-secondary",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      // Width, not translateX. A transform is a physical axis and ignores
      // direction, so on the Hebrew site the bar emptied from the reading
      // start and filled towards it — backwards, and only ever noticed by
      // someone reading Hebrew.
      className="h-full bg-primary transition-all"
      style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
