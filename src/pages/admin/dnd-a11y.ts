import type { Announcements, ScreenReaderInstructions } from "@dnd-kit/core";

/**
 * What a screen reader says while something is being dragged.
 *
 * dnd-kit ships defaults, and they are unusable here for two reasons. They are
 * in English, on an interface that is entirely Hebrew. And they announce the
 * item by its `id` — which in this app is a UUID — so reordering a collection
 * reads out a thirty-six character hex string, letter by letter, through a
 * Hebrew voice, into an assertive live region that interrupts whatever the
 * person was reading. It says nothing about where the item landed.
 *
 * Given a way to turn an id into a name AND into a position, this says both.
 *
 * The position half used to be unreachable: `at()` took optional position and
 * total arguments and both call sites passed neither, so every announcement
 * fell to "next to <name>" — which is the one thing a person who cannot see
 * the list already knows, since it is the item they are dragging past. Where
 * it landed, out of how many, is the part that was missing.
 */
export function dragAnnouncements(
  nameOf: (id: string) => string,
  placeOf: (id: string) => { position: number; total: number } | null,
): Announcements {
  const at = (over: { id: string | number } | null) => {
    if (!over) return "";
    const place = placeOf(String(over.id));
    return place
      ? ` למקום ${place.position} מתוך ${place.total}`
      : ` ליד ${nameOf(String(over.id))}`;
  };

  return {
    onDragStart: ({ active }) => `הרמת ${nameOf(String(active.id))}. השתמשו בחצים כדי להזיז.`,
    onDragOver: ({ active, over }) =>
      over ? `${nameOf(String(active.id))} נמצא כעת${at(over)}.` : "",
    onDragEnd: ({ active, over }) =>
      over
        ? `${nameOf(String(active.id))} הונח${at(over)}.`
        : `${nameOf(String(active.id))} הוחזר למקומו.`,
    onDragCancel: ({ active }) => `הגרירה בוטלה. ${nameOf(String(active.id))} חזר למקומו.`,
  };
}

/** The instructions read once, when a drag handle takes focus. */
export const dragInstructions: ScreenReaderInstructions = {
  draggable:
    "כדי לשנות סדר: הקישו רווח או Enter כדי להרים, חצים למעלה ולמטה כדי להזיז, " +
    "רווח שוב כדי להניח, ו-Escape כדי לבטל.",
};

/**
 * dnd-kit hardcodes `aria-roledescription="sortable"` on every handle, in
 * English. A role description REPLACES the role in the announcement, so the
 * control is described in a language the interface does not use and is never
 * announced as a button at all.
 */
export const sortableHandleAttributes = { roleDescription: "ניתן לגרירה" };
