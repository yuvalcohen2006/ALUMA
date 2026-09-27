import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/**
 * What the button sits on.
 *
 *   light       the white page, the grey bands, a pale photograph (default)
 *   dark        a charcoal band: a dark tablet with light ink
 *   terracotta  a terracotta band: the flood turns charcoal, since a
 *               terracotta flood on terracotta would make the button vanish
 */
export type ShineSurface = "light" | "dark" | "terracotta";

type Base = {
  children: ReactNode;
  on?: ShineSurface;
  className?: string;
};

/** A page inside the site. */
type AsLink = Base & { to: string; href?: never } & Omit<LinkProps, "to" | "className" | "children">;
/** Somewhere outside it: Waze, Google Maps, WhatsApp, a phone number. */
type AsAnchor = Base & { href: string; to?: never } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "className" | "children"
  >;
/** An action on the page: send a form, open one, try again. */
type AsButton = Base & { to?: never; href?: never } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "children"
  >;

export type ShineButtonProps = AsLink | AsAnchor | AsButton;

/** The classes, for the odd element that has to render its own tag. */
export const shineClass = (on: ShineSurface = "light", className?: string) =>
  cn("btn-shine", on === "dark" && "btn-shine-dark", on === "terracotta" && "btn-shine-terracotta", className);

/**
 * The site's one button.
 *
 * A flat, hairline-bordered tablet that floods terracotta from below on hover.
 * Styling lives in index.css (.btn-shine) so the hover can use pseudo-elements.
 * One size everywhere; the only variation is the surface it sits on.
 *
 * It started as the call to action at the foot of the projects page and the
 * owner asked for every button on every page to be this one, in place of the
 * rounded pills. So it renders whichever element the job needs: a router link,
 * a plain link to another site, or a real <button> for forms.
 */
const ShineButton = (props: ShineButtonProps) => {
  if ("to" in props && props.to !== undefined) {
    const { to, children, on, className, ...rest } = props as AsLink;
    return (
      <Link to={to} className={shineClass(on, className)} {...rest}>
        {children}
      </Link>
    );
  }
  if ("href" in props && props.href !== undefined) {
    const { href, children, on, className, ...rest } = props as AsAnchor;
    return (
      <a href={href} className={shineClass(on, className)} {...rest}>
        {children}
      </a>
    );
  }
  const { children, on, className, type = "button", ...rest } = props as AsButton;
  return (
    <button type={type} className={shineClass(on, className)} {...rest}>
      {children}
    </button>
  );
};

export default ShineButton;
