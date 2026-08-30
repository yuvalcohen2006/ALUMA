import { describe, expect, it } from "vitest";
import { contentDirection, directionFor, latinFieldProps } from "./field-direction";

/**
 * A field on a Hebrew page that holds a Latin value — an email, a phone
 * number — has two directions to serve. Empty, it shows a Hebrew prompt that
 * belongs on the right. Filled, it holds Latin that belongs on the left.
 *
 * `dir="auto"` gets this exactly backwards: it reads the VALUE, so an empty
 * field has no strong character and falls back to left-to-right, parking the
 * Hebrew placeholder against the wrong edge.
 */
describe("directionFor", () => {
  it("reads right-to-left while the field is empty, for the prompt", () => {
    expect(directionFor("")).toBe("rtl");
  });

  it("treats whitespace as empty", () => {
    expect(directionFor("   ")).toBe("rtl");
  });

  it("switches to left-to-right as soon as something is typed", () => {
    expect(directionFor("d")).toBe("ltr");
    expect(directionFor("dana@example.com")).toBe("ltr");
    expect(directionFor("050-451-9062")).toBe("ltr");
  });
});

describe("latinFieldProps", () => {
  it("starts a field off right-to-left", () => {
    expect(latinFieldProps.dir).toBe("rtl");
  });

  it("flips an uncontrolled field as it is typed into", () => {
    const el = document.createElement("input");
    el.dir = "rtl";
    el.value = "d";
    latinFieldProps.onInput({ currentTarget: el } as never);
    expect(el.dir).toBe("ltr");
  });

  it("flips it back when the field is emptied again", () => {
    const el = document.createElement("input");
    el.dir = "ltr";
    el.value = "";
    latinFieldProps.onInput({ currentTarget: el } as never);
    expect(el.dir).toBe("rtl");
  });
});

/**
 * The other half of the problem, and the one the standards call the defining
 * CMS case: a field whose value could be either language. A product might be
 * "ספה מודולרית" or "Sunbrella Lounge", and the admin cannot know which.
 */
describe("contentDirection", () => {
  it("faces right while empty, because the interface is Hebrew", () => {
    // dir="auto" alone would fall back to left-to-right on an empty field and
    // put the cursor on the wrong edge of a Hebrew form.
    expect(contentDirection("")).toBe("rtl");
    expect(contentDirection("   ")).toBe("rtl");
  });

  it("hands direction to the browser once there is something to judge", () => {
    expect(contentDirection("ספה")).toBe("auto");
    expect(contentDirection("Sunbrella Lounge")).toBe("auto");
    expect(contentDirection("2024")).toBe("auto");
  });
});
