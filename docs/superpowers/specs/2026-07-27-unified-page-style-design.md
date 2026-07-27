# Unified interior-page style + filter sidebar

**Date:** 2026-07-27
**Goal:** Every public content page opens the same way — the "Our Story" treatment — and every page that filters content does it through one sidebar drawer instead of inline link rows.

The home page (`src/pages/Index.tsx` and everything under `src/components/home/`) is **out of scope and must not be touched**.

---

## 1. Background

The site currently has two competing interior-page headers:

| | Our Story (`Story.tsx`) | Everything else (`PageHero.tsx`) |
|---|---|---|
| Background | flat `bg-background` | sand band (`gradient-cream`) + radial light-pool glow |
| Title | 36px, `text-primary` (terracotta), right-aligned, hairline divider under it | 36px, `text-foreground` (charcoal), centered, no divider |
| Body copy | 20px / 1.75 | page defaults (~16px, `text-muted-foreground`) |

Our Story wins. The sand band and the light-pool glow are removed from the site entirely.

---

## 2. The shared shell — `PageHero`

`src/components/PageHero.tsx` is rewritten. The sand band, both radial-gradient overlay divs and the bottom seam line are deleted.

### Structure

```
<section>  bg-background, pt-[127px], pb-4 md:pb-6
  <div class="container-luxury">
    <div class="flex items-end justify-between">
      {filterSlot}                        ← left edge (RTL end), optional
      <div class="inline-block text-right">   ← right edge (RTL start)
        <h1>  {title}  </h1>
        <span class="block w-full h-px bg-primary/50 mt-4" aria-hidden />
      </div>
    </div>
    {subtitle?}
  </div>
</section>
```

The `inline-block` wrapper is what makes the divider match the title's own rendered width — carried over from `Story.tsx` verbatim.

### Title token

```
font-display text-3xl sm:text-4xl md:text-5xl text-primary animate-rise-in whitespace-nowrap
```

- **Size:** 30px → 36px (`sm`) → 48px (`md`+). This is `SofaDesigner.tsx:171`'s scale, chosen by the user as the site-wide h1.
- **Colour:** `text-primary` — terracotta, `hsl(14 47% 58%)`.
- **Weight:** `.font-display` sets 400, overriding the base `h1 { font-weight: 300 }` in `index.css`. Same as both reference titles.
- **Alignment:** right edge of `container-luxury` (RTL start).
- **Entrance:** `animate-rise-in`, as Story has today.

### Props

```ts
interface PageHeroProps {
  title: ReactNode;
  /** One line under the divider, rendered at .text-body in foreground-soft. */
  subtitle?: ReactNode;
  /** Filter trigger, pinned to the opposite (left) edge of the title row. */
  filterSlot?: ReactNode;
}
```

The current `children` prop is dropped — its only consumer is `Collections.tsx`'s inline category links, which this spec replaces with the drawer.

---

## 3. Typography — running text at 18px

New utility in `src/index.css`, in the existing `@layer utilities` block:

```css
.text-body {
  font-size: 18px;
  line-height: 1.75;
}
```

Applied to **main body copy only**:

- Story's paragraph stack (20px → 18px)
- Intro / lead paragraphs on listing pages
- FAQ answers
- Legal pages: Privacy, Terms, Accessibility
- Long-form prose on detail pages: `longDesc`, `story`, `intro`, blog article body

**Not** applied to: card titles, card descriptions, image captions, buttons, prices, nav items, badges, spec-panel labels, `SectionLabel`. Card grids keep their current metrics so nothing reflows.

---

## 4. Header border

`src/components/Header.tsx` currently carries:

```ts
const alwaysBorderedRoutes = ["/story"];
```

With the sand band gone site-wide, that inverts — every route except the home page gets the border immediately instead of waiting for scroll:

```ts
const forceBorder = pathname !== "/";
```

---

## 5. Filter sidebar

### 5.1 New: `src/components/ui/sheet.tsx`

Standard shadcn Sheet built on `@radix-ui/react-dialog` — already a dependency (`src/components/ui/dialog.tsx` uses it). Gives portal, overlay, focus trap, Escape-to-close and scroll lock for free.

It slides in from the **right**, mirroring the site's existing mobile-nav drawer (`Header.tsx:259`): `bg-black/40 backdrop-blur-sm` overlay, `bg-background shadow-luxury border-l border-border` panel, `duration-500 ease-out`. Same motion and chrome, so the two drawers read as one system.

### 5.2 New: `src/components/FilterSidebar.tsx`

Generic and data-driven, so adding a filter group later is config rather than code:

```ts
interface FilterGroup {
  key: string;                              // URL param key, e.g. "cat"
  label: string;                            // e.g. "קטגוריה"
  options: { value: string; label: string; count?: number }[];
}

interface FilterSidebarProps {
  groups: FilterGroup[];
  value: Record<string, string[]>;
  onChange: (next: Record<string, string[]>) => void;
  resultCount: number;
}
```

Exports two things: the drawer itself and a `<FilterTrigger>` button for `PageHero`'s `filterSlot`.

- **Trigger:** outlined button, `סינון` + icon, with a count badge when filters are active. Sits at the left edge of the `PageHero` title row, opposite the title. Styling matches the existing outlined-button pattern in `Collections.tsx:106` (`border-primary/30 text-primary hover:bg-primary`).
- **Panel:** ~360px, `bg-background`, one titled section per group, checkbox rows (multi-select within a group, AND across groups).
- **Footer:** `נקה הכל` (clears everything) and `הצג {resultCount} תוצאות` (closes the drawer).
- **Empty groups** (zero options) are not rendered.

### 5.3 URL state

Filter state lives in query params — `?cat=salon,tables&tag=firepit` — via `useSearchParams`, so filtered views are shareable and the back button works.

A shared `useFilterParams(groups)` hook owns parse/serialise so each page doesn't reimplement it.

### 5.4 Per-page wiring

| Page | Groups | Source |
|---|---|---|
| **Collections** | קטגוריה, סוג מוצר | `site_collections.name_he`; `site_collection_products.tag` |
| **Blog** | נושא | `blog_posts.tag` |
| **Projects** | סוג מרחב, אזור | `Project.tag`, `Project.location` in `src/data/projects.ts` |

Option lists are derived from the loaded data, not hardcoded — so when the Sanity content source lands, new values appear in the drawer automatically.

**Collections back-compat:** the header's קולקציות dropdown links to `/collections#slug`. Those links must keep working. On mount, if a hash is present, it is folded into filter state as `cat=<slug>` and the hash is cleared. The existing `useEffect` that smooth-scrolls to the hashed section is removed — with the drawer filtering the list, there is nothing to scroll to.

**Known limitation, accepted:** `src/data/projects.ts` holds 6 projects and every `tag` is unique, so each Projects filter currently returns exactly one result. The user accepted this — the UI is built for the data that is coming, not the data that is there.

**Materials is excluded from filtering.** `src/data/materials.ts` has no grouping field and only 5 entries. It gets the new hero and typography but no filter button, until real category data exists.

---

## 6. Page-by-page scope

### Full treatment — new `PageHero` + `.text-body`

`Collections`, `Projects`, `Materials`, `Blog`, `BeforeAfter`, `FAQ`, `Contact`, `Privacy`, `Terms`, `Accessibility`, `NotFound`, `ThankYou`

`NotFound` and `ThankYou` currently roll their own headers and get converted.

`Questionnaire` already imports `PageHero`, so it inherits the new look with no edit. That is fine and intended.

### Story — adopts the shared hero

`Story.tsx`'s bespoke hero section (lines 27–48) is deleted and replaced with `<PageHero title="הסיפור שלנו" />`. Its title therefore moves from the right-half grid column to the container's right edge and grows to 48px. Its paragraph stack drops to `.text-body` (18px). The two-column content grid below is untouched.

The `pt-3 md:pt-4` on the content section is re-tuned to sit correctly under the shared hero's padding.

### Detail pages — title token + body only

`CollectionDetail`, `ProjectDetail`, `MaterialDetail`, `BlogPost`

These have image-and-spec-panel heroes that would break under a forced `PageHero`. Only two changes each:

1. The `h1` adopts the standard token — `text-3xl sm:text-4xl md:text-5xl text-primary`, replacing the current `text-3xl md:text-4xl lg:text-5xl font-light` / `text-4xl md:text-6xl` variants.
2. Prose blocks get `.text-body`.

Their layouts, image treatments and `gradient-cream` CTA bands at the bottom stay as-is. Those bottom bands are section backgrounds, not page headers, and are out of scope.

### Untouched

- **Home** (`Index.tsx`, `src/components/home/**`) — explicitly forbidden
- Sofa Designer, Fabric Configurator, AR Preview
- Account, Auth, Club
- `src/pages/admin/**`

---

## 7. Cleanup

`SectionLabel` loses its last callers on `NotFound`, `CollectionDetail` and `ProjectDetail` page headers. It stays in the codebase — it is still used for in-page section headings and by home-page components, which are out of scope.

`gradient-cream` stays defined in `index.css` — still used by in-page CTA bands and home sections.

---

## 8. Verification

- `npm run build` passes clean.
- Every in-scope route renders with a right-aligned terracotta title at 48px on desktop, over a flat cream background, with no sand band anywhere above the fold.
- Home page renders byte-identical — confirmed by `git diff` touching no file under `src/components/home/` or `src/pages/Index.tsx`.
- `/collections#salon` (a header dropdown link) still lands on a filtered Collections view.
- The drawer opens, filters, clears, closes on Escape, and traps focus; the URL updates and survives a reload and a back-button press.
- RTL: drawer enters from the right, checkbox labels read right-to-left, nothing overflows horizontally at 375px.
