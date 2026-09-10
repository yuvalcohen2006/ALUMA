import type { ImgHTMLAttributes } from "react";

/**
 * The LCP hint, spelled the way React 18 will actually pass through.
 *
 * Two spellings disagree here. `@types/react` declares only `fetchPriority`,
 * the camelCase form React 19 understands — but React 18.3's runtime does not
 * know it and logs "React does not recognize the `fetchPriority` prop on a DOM
 * element" on every render, which is a warning in the console of every visitor
 * to the home page. The lowercase `fetchpriority` is what the HTML attribute
 * is called, and React 18 passes unknown lowercase attributes straight to the
 * DOM without complaint.
 *
 * Spread this rather than writing either spelling by hand, so there is one
 * place to change when React 19 makes camelCase the right answer.
 */
export const HIGH_FETCH_PRIORITY = {
  fetchpriority: "high",
} as unknown as ImgHTMLAttributes<HTMLImageElement>;
