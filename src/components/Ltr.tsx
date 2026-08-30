import type { ReactNode } from "react";

/**
 * A Latin or numeric run inside Hebrew text — a size, a path, an address.
 *
 * <bdi> is the element built for this: it isolates its contents from the
 * surrounding paragraph's direction, so "2400 × 1350" cannot be reordered
 * into "1350 × 2400" and a path's leading slash cannot hop to the far end.
 * `dir="ltr"` on top of it fixes the direction inside the isolate.
 */
const Ltr = ({ children, className }: { children: ReactNode; className?: string }) => (
  <bdi dir="ltr" className={className}>
    {children}
  </bdi>
);

export default Ltr;
