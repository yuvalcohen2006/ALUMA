import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * One control for every photograph in the admin.
 *
 * What the owner asked for, in order: click a photo and it opens to be moved;
 * a small − on the corner deletes it, after saying so; a dashed square beside
 * it adds another, by click or by dropping a file on it.
 */
const crop = vi.hoisted(() => ({
  fromFile: vi.fn(async () => new File(["x"], "cropped.jpg", { type: "image/jpeg" })),
  fromUrl: vi.fn(async () => new File(["x"], "cropped.jpg", { type: "image/jpeg" })),
}));
const storage = vi.hoisted(() => ({ next: "https://cdn.test/new.jpg" }));

vi.mock("@/components/admin/CropProvider", () => ({
  useCrop: () => crop.fromFile,
  useAdjustPhoto: () => crop.fromUrl,
}));
vi.mock("@/lib/admin-storage", () => ({
  uploadFile: async () => ({ url: storage.next, path: "p" }),
}));

const PhotoTiles = (await import("./PhotoTiles")).default;

const A = "https://cdn.test/a.jpg";
const B = "https://cdn.test/b.jpg";

beforeEach(() => {
  crop.fromFile.mockClear();
  crop.fromUrl.mockClear();
});

describe("the photo strip", () => {
  it("shows a tile per photo and one square for adding another", () => {
    render(<PhotoTiles photos={[A, B]} onChange={() => {}} spec="product" />);
    expect(screen.getAllByAltText("")).toHaveLength(2);
    expect(screen.getByLabelText("הוספת תמונה")).toBeTruthy();
    // The size is on the add square, and nowhere else: no paragraph above it.
    expect(screen.getByText("1600 × 1600")).toBeTruthy();
  });

  it("opens a photo to be moved when it is clicked", async () => {
    const onChange = vi.fn();
    render(<PhotoTiles photos={[A]} onChange={onChange} spec="product" />);
    await userEvent.click(screen.getAllByLabelText("לפתוח את התמונה ולהזיז אותה")[0]);
    await waitFor(() => expect(crop.fromUrl).toHaveBeenCalledWith(A, "product"));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([storage.next]));
  });

  it("asks before it deletes, and deletes only the one asked about", async () => {
    const onChange = vi.fn();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<PhotoTiles photos={[A, B]} onChange={onChange} spec="product" />);
    await userEvent.click(screen.getAllByLabelText("מחיקת התמונה")[0]);
    expect(confirmSpy).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith([B]);
    confirmSpy.mockRestore();
  });

  it("keeps the photo when the warning is dismissed", async () => {
    const onChange = vi.fn();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<PhotoTiles photos={[A]} onChange={onChange} spec="product" />);
    await userEvent.click(screen.getByLabelText("מחיקת התמונה"));
    expect(onChange).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("adds a photo dropped onto the square, through the same crop step", async () => {
    const onChange = vi.fn();
    render(<PhotoTiles photos={[A]} onChange={onChange} spec="product" />);
    const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });
    const add = screen.getByLabelText("הוספת תמונה");

    const drop = new Event("drop", { bubbles: true }) as Event & { dataTransfer: unknown };
    Object.defineProperty(drop, "dataTransfer", { value: { files: [file] } });
    add.dispatchEvent(drop);

    await waitFor(() => expect(crop.fromFile).toHaveBeenCalledWith(file, "product"));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([A, storage.next]));
  });

  it("replaces rather than appends when the field holds one photo", async () => {
    const onChange = vi.fn();
    render(<PhotoTiles photos={[A]} onChange={onChange} spec="material" single />);
    // With one photo there is nothing to add to, so no add square is shown.
    expect(screen.queryByLabelText("הוספת תמונה")).toBeNull();
    await userEvent.click(screen.getByLabelText("לפתוח את התמונה ולהזיז אותה"));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([storage.next]));
  });

  it("marks the first tile where a strip has a main photograph", () => {
    render(<PhotoTiles photos={[A, B]} onChange={() => {}} spec="product" firstLabel="ראשית" />);
    expect(screen.getAllByText("ראשית")).toHaveLength(1);
  });
});
