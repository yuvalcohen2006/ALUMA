import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ImageCropDialog from "./ImageCropDialog";
import type { LoadedImage } from "@/lib/image-io";

/**
 * The stage has to be measured on the FIRST open.
 *
 * Radix mounts a dialog through Presence and Portal, and both render null for
 * one extra commit. A layout effect keyed on `open` therefore ran while the
 * stage div did not exist, hit its own null check, and never ran again — so
 * the first crop of every page load showed a black rectangle with no
 * photograph, a crop window collapsed to its 1px floor, and both position
 * sliders disabled because there was no slack to move through. It only came
 * right on the second open, using a size measured when the dialog last closed.
 */

const STAGE_W = 700;
const STAGE_H = 400;

let widthSpy: ReturnType<typeof vi.spyOn>;
let heightSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  // jsdom lays nothing out, so every element reports 0. Give the stage a size.
  widthSpy = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(STAGE_W);
  heightSpy = vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(STAGE_H);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  widthSpy.mockRestore();
  heightSpy.mockRestore();
  vi.unstubAllGlobals();
});

const image: LoadedImage = {
  url: "blob:fake",
  width: 2000,
  height: 1500,
  downscaled: false,
  release: () => {},
};

const open = () =>
  render(
    <ImageCropDialog
      open
      image={image}
      spec="product"
      fileName="chair.jpg"
      onCancel={() => {}}
      onConfirm={() => {}}
    />,
  );

const stage = () => screen.getByRole("group", { name: "מיקום התמונה במסגרת" });

describe("the crop stage, on the very first open", () => {
  it("shows the photograph rather than a black rectangle", async () => {
    open();
    await waitFor(() => expect(stage().querySelectorAll("img").length).toBe(2));
  });

  /**
   * Both range inputs are the WCAG 2.5.7 alternative to dragging. With an
   * unmeasured stage the window collapsed to 1px, leaving no slack, and the
   * component disables a slider that cannot move — so the only non-drag way to
   * operate the control was dead exactly when it was needed.
   */
  it("leaves the position sliders usable", async () => {
    open();
    await waitFor(() =>
      expect(screen.getByLabelText("מיקום אופקי").hasAttribute("disabled")).toBe(false),
    );
  });

  it("gives the crop window a real size, not the 1px floor", async () => {
    open();
    await waitFor(() => {
      const frame = stage().querySelector("[style*='width']") as HTMLElement | null;
      expect(frame).toBeTruthy();
      expect(parseFloat(frame!.style.width)).toBeGreaterThan(100);
    });
  });
});
