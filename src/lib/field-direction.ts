import type { FormEvent } from "react";

/**
 * Which way a field holding a Latin value should read on a Hebrew page.
 *
 * Empty means the placeholder is showing, and the placeholder is Hebrew — so
 * the field reads right-to-left. The moment anything is typed it holds an
 * address or a number, which reads left-to-right.
 *
 * This is what `dir="auto"` is for, except `auto` decides from the value and
 * an empty value has no direction, so it falls back to left-to-right and puts
 * the Hebrew prompt on the wrong edge.
 */
export const directionFor = (value: string): "rtl" | "ltr" =>
  value.trim() ? "ltr" : "rtl";

/**
 * Spread onto an uncontrolled Latin field (email, phone) to get the same
 * behaviour without lifting its value into React state.
 */
export const latinFieldProps = {
  dir: "rtl" as const,
  onInput: (e: FormEvent<HTMLInputElement>) => {
    e.currentTarget.dir = directionFor(e.currentTarget.value);
  },
};

/**
 * Which way a field should read when its value could be either language.
 *
 * This is the case the W3C calls out as the defining CMS problem: content
 * arrives from a database or a person, and nobody knows its direction at
 * authoring time. The answer there is `dir="auto"`, which infers direction
 * from the first strong character.
 *
 * The one thing `auto` gets wrong is the empty field: with no strong
 * character it falls back to left-to-right, which parks the cursor on the
 * wrong edge of a Hebrew form. So: right-to-left until there is something to
 * judge, and `auto` from then on.
 */
export const contentDirection = (value: string): "rtl" | "auto" =>
  value.trim() ? "auto" : "rtl";
