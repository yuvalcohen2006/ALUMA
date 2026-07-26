import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ShineButtonProps {
  to: string;
  children: ReactNode;
  /** Light ink for the charcoal materials rail. */
  invert?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Monochrome sweep button. Styling lives in index.css (.btn-shine) so the hover
 * sweep can use a pseudo-element. Deliberately one fixed size — every button of
 * this design matches, no variants.
 */
const ShineButton = ({ to, children, invert = false, className, ...rest }: ShineButtonProps) => (
  <Link
    to={to}
    className={cn("btn-shine", invert && "btn-shine-invert", className)}
    {...rest}
  >
    {children}
  </Link>
);

export default ShineButton;
