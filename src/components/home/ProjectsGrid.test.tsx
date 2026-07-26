import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import ProjectsGrid from "./ProjectsGrid";
import { projects } from "@/data/projects";

// Inner fill span width for each progress "dot", in slide order.
const barWidths = () =>
  screen.getAllByLabelText(/מעבר לפרויקט/).map((btn) => {
    const spans = btn.querySelectorAll("span");
    return (spans[1] as HTMLElement)?.style.width;
  });

describe("ProjectsGrid progress strip", () => {
  it("fills every bar before the active slide, including the last one", () => {
    render(
      <MemoryRouter>
        <ProjectsGrid />
      </MemoryRouter>,
    );
    for (let n = 1; n <= projects.length; n++) {
      if (n > 1) fireEvent.click(screen.getByLabelText(`מעבר לפרויקט ${n}`));
      const w = barWidths();
      w.forEach((width, i) => {
        // bars before the active slide are full; the active one starts at 0.
        expect(width).toBe(i < n - 1 ? "100%" : "0%");
      });
    }
  });

  it("freezes the progress bar on hover instead of resetting it to empty", () => {
    vi.useFakeTimers();
    let t = 1000;
    const nowSpy = vi.spyOn(performance, "now").mockImplementation(() => t);
    try {
      render(
        <MemoryRouter>
          <ProjectsGrid />
        </MemoryRouter>,
      );
      // Let the first bar fill partway (6s of the 20s slide ≈ 30%).
      act(() => {
        t += 6000;
        vi.advanceTimersByTime(6000);
      });
      const before = parseFloat(barWidths()[0]);
      expect(before).toBeGreaterThan(10);

      // Hovering the section pauses it — this must NOT wipe the bar.
      act(() => {
        fireEvent.mouseEnter(document.querySelector("section")!);
      });
      const after = parseFloat(barWidths()[0]);
      expect(after).toBeGreaterThanOrEqual(before - 1);
    } finally {
      nowSpy.mockRestore();
      vi.useRealTimers();
    }
  });
});
