import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";

/**
 * Every public page, mounted.
 *
 * The suite had 379 tests and not one of them asked the simplest question a
 * deploy depends on: does this page render at all? Every page test so far
 * covered one component in isolation, so a page could throw on mount — a bad
 * import, a hook called on a null row, a helper that moved — and the whole
 * suite would still be green. This is the floor under all of it.
 */

// Nothing here should reach the network. Every query resolves empty, which is
// also the hardest case for a page: no products, no articles, no projects.
const empty = { data: [], error: null };
const chain: Record<string, unknown> = {};
for (const k of ["select", "eq", "neq", "in", "gte", "not", "order", "limit", "range"]) {
  chain[k] = () => chain;
}
chain.single = async () => ({ data: null, error: null });
chain.maybeSingle = async () => ({ data: null, error: null });
chain.then = (res: (v: unknown) => unknown) => Promise.resolve(empty).then(res);

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => chain,
    functions: { invoke: async () => ({ data: { ok: true }, error: null }) },
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({ error: null }),
    },
  },
}));

const { publicRoutes } = await import("./routes");

const PATHS = [
  "/", "/story", "/collections", "/journal", "/projects", "/faq", "/club",
  "/materials", "/materials/sunbrella", "/diy", "/fabric", "/questionnaire",
  "/thank-you", "/terms", "/privacy", "/accessibility", "/ar",
  "/collections/does-not-exist", "/products/does-not-exist",
  "/projects/villa-kfar-shmaryahu", "/journal/does-not-exist",
  "/definitely-not-a-page",
];

const mount = (path: string) =>
  render(
    <HelmetProvider>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={[path]}>
          <Suspense fallback={<div>loading</div>}>
            <Routes>{publicRoutes}</Routes>
          </Suspense>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );

describe("every public page mounts", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it.each(PATHS)("renders %s without throwing", async (path) => {
    const errors: unknown[] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((...a) => errors.push(a));
    try {
      mount(path);
      // Past the lazy chunk and the first data effect.
      // Generous, because this asks "does it mount", not "how fast". The club
      // and questionnaire pages take about a second to resolve their lazy
      // chunks, and a 1s default made them fail only when the rest of the
      // suite was running beside them.
      await waitFor(() => expect(document.querySelector("main")).toBeTruthy(), {
        timeout: 8000,
      });
      expect(document.body.textContent?.length ?? 0).toBeGreaterThan(0);
      const real = errors.filter(
        (e) => !/not wrapped in act|useLayoutEffect|404 Error: User attempted/i.test(String(e)),
      );
      // The 404 page logs its own miss on purpose (NotFound.tsx), and React
      // act() noise is a test artefact, not a page defect. Everything else
      // is something a visitor would see in their console.
      expect(real.map((e) => String(e).slice(0, 120))).toEqual([]);
    } finally {
      spy.mockRestore();
    }
  });

  it("renders the English tree too", async () => {
    mount("/en/collections");
    await waitFor(() => expect(document.querySelector("main")).toBeTruthy());
    expect(document.body.textContent).toBeTruthy();
  });
});
