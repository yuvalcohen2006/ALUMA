import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ShineActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Light ink for charcoal bands. */
  invert?: boolean;
}

/**
 * The <button> sibling of ShineButton — identical .btn-shine look for actions
 * that are not navigations (form submits, AR launches, wizard steps). Exists so
 * nobody wraps a Link around a non-navigation again just to get the style.
 */
const ShineAction = forwardRef<HTMLButtonElement, ShineActionProps>(
  ({ invert = false, className, type = "button", ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn("btn-shine", invert && "btn-shine-invert", className)}
      {...rest}
    />
  )
);
ShineAction.displayName = "ShineAction";

export default ShineAction;
