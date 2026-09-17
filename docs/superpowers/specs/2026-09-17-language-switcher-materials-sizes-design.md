# Language button, materials as objects, sizes on products

17 September 2026. Agreed with the owner before any code was written.

## Why

Three requests from the client, in one branch of work:

1. The language link in the header should become a button that opens a small
   menu with a flag per language, the current one marked.
2. Materials should be things the client creates in the admin — photo, name,
   explanation — all shown on one materials page in one composition.
3. A product should carry the materials it is made of and its exact sizes, and
   its page should show them in boxes matching the existing "על המוצר" card.

## Decisions taken (owner's answers)

| Question | Answer |
|---|---|
| The four materials built into the code | Move them into the database; the client edits them like any other. Their features list and Q&A are folded into the explanation or dropped |
| Per-material pages (`/materials/sunbrella`) | Retire them. One `/materials` page, anchors per material, old addresses redirect |
| How sizes are typed | Rows of label + value (`אורך` / `240 ס״מ`) |
| The product's free-text חומרים box | Replaced by a picker of existing materials |

## 1. The language button

`LanguageSwitcher` becomes a disclosure button plus a menu.

- Trigger: flag of the CURRENT language, its name in its own script
  (`עברית` / `English`), a chevron. `aria-haspopup="menu"`, `aria-expanded`.
- Menu: one row per language, each a real `<a href>` to the same page in that
  language (`localizePath`), with `hrefLang`/`lang`. The current row is tinted,
  ticked, and carries `aria-current="true"`.
- Closes on Escape, outside click, and route change. Focus returns to the
  trigger on Escape.
- Flags are inline SVG, not emoji: Windows renders flag emoji as two letters.
- The name stays beside the flag. A flag-only switcher is a country standing in
  for a language, which fails WCAG name/label rules and reads badly for
  English-speakers outside the US. Owner asked for 🇮🇱 and 🇺🇸 explicitly.

Used in the header, the mobile menu and the footer (inverted colours).

## 2. Materials as objects

### Table `site_materials`

| column | |
|---|---|
| `id` | uuid, primary key |
| `slug` | text, unique — the anchor on /materials |
| `name`, `name_en` | Hebrew name, optional English |
| `tagline` | one line under the name |
| `body` | the explanation; blank lines separate paragraphs |
| `image_url` | uploaded through the crop window, 4:3 |
| `sort_order`, `published`, `created_at`, `updated_at` | as every other CMS table |

RLS: anyone reads published rows; admins write. Seeded with the four existing
materials, `image_url` left null.

### Falling back

`useMaterials()` (react-query, key `["materials"]`) returns database rows, and
returns the four built-in materials when the table is missing, unreachable or
empty. The code deploys before the SQL is run, so the site must not depend on
the migration having happened. Rows whose `image_url` is null and whose slug is
one of the four built-ins fall back to the bundled photograph, so the seeded
rows look right before the client uploads anything.

### Pages

- `/materials`: intro, then one block per material, all identical — photograph
  on the reading-end side at ~380px, name, tagline and explanation on the
  reading-start side. Each block carries `id={slug}` and scroll margin.
- Arriving at `/materials#slug` scrolls to that material and lights it briefly
  (`:target`).
- `/materials/:slug` redirects to `/materials#slug`, keeping `/en`.
- The home strip and the "worth knowing" page read the same hook and link to
  the anchors. Footer material links too.

### Admin

`/admin/materials`, listed in the sidebar as **חומרים**. One screen, rows like
the reviews screen: photo (crop window, 4:3), name, tagline, explanation,
published, order, delete. New material button at the top.

## 3. Products: materials and sizes

Two new columns on `site_collection_products`:

- `material_ids jsonb` — ids of the materials ticked in the form.
- `sizes jsonb` — `[{ label, value }]`.

The old free-text `materials` column stays in place, unread; every row is empty
today. `dimensions` (also empty everywhere) is shown as a single size row if a
product ever has one and no `sizes`.

### The product page

- The name, tagline and price move above the photograph, aligned to the start
  of the photograph column, replacing the centred block.
- The photograph column narrows (5 of 12 columns), the text column takes 7.
- Right column, in order: **על המוצר**, **מידות**, **חומרים** — the same
  bordered card, heading and rule for all three.
- Sizes: label and value per row, hairline between rows, numbers isolated LTR.
- Materials: a row each — small photograph, name, arrow — linking to
  `/materials#slug`.
- A product with no sizes or no materials simply has no such box.

## Testing

- The switcher: opens, lists both languages, marks the current one, links to
  the mirrored path, closes on Escape.
- `useMaterials` falls back to the built-in four when the query fails.
- `/materials` renders every material with its anchor id; `/materials/:slug`
  redirects.
- The product page renders sizes and material rows, links to the anchors, and
  all three boxes share one class recipe.
- Existing suites stay green: 447 tests before this work.

## Order of work

The switcher first (self-contained), then the materials table, admin screen and
pages, then the product form and product page. `docs/PROGRESS.md` is updated at
each of those points, and `docs/ACTION.md` gains the migration step.
