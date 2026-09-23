# Where the site stands

## Phone number, two bugs, and the admin panel — 23 September

```
████████████████████  done
```

**One thing to do, and it is the same one as last time:** run
`supabase/migrations/20260917120000_materials_and_sizes.sql`. Step 1 of
[ACTION.md](ACTION.md), about thirty seconds.

### The two bugs, and why

| | |
|---|---|
| 🔎 | **Both had one cause: that script was never run.** The materials table and the two product columns do not exist in the live database, so "חומר חדש" could not create anything, and saving a product with sizes failed — PostgREST refuses the whole save for one unknown column, so the rest of the edit went with it |
| ✅ | The admin now says so on screen, with the five clicks that fix it, instead of a red toast that vanishes |
| ✅ | A product save no longer loses everything else: the name, photos and text save, and the screen says the sizes and materials did not |
| ✅ | The four materials the site already has are in the script, so they arrive as real materials you can edit and tick on products |

### The phone number

| | |
|---|---|
| ✅ | **054-444-8797** everywhere: the footer, the contact page, WhatsApp, the click-to-call links, the Google listing in the page head, and the file search engines read |

### Sizes

| | |
|---|---|
| ✅ | Three boxes — אורך, רוחב, גובה — each a number in centimetres. The ס״מ is written by the site, not typed |
| ✅ | A box left empty is simply not shown on the product page |
| ⛔ | The "הערה ליד המחיר" box is gone |

### The admin panel

| | |
|---|---|
| ✅ | Nothing under 16px anywhere in the panel. A test keeps it that way |
| ✅ | A trail at the top of every screen: ניהול ‹ קולקציות ומוצרים ‹ dex, each step clickable |
| ✅ | On a phone the twenty links were one sideways-scrolling row at 12px. They are a proper menu now, the same grouped sidebar in a drawer |
| ✅ | Content sits in a centred column instead of hugging the left of a wide screen |
| ⛔ | Every paragraph that explained the panel to itself is gone — 24 of them, including all three you named |

486 tests pass.

---

## Language button, materials and sizes — 17 September

```
████████████████████  done
```

**One script to run before the new screens work** — step 1 of
[ACTION.md](ACTION.md). Until it is run the site shows the four materials it
was built with, exactly as before.

### The language button

| | |
|---|---|
| ✅ | A button showing the language you are in, with its flag. Click it and both languages drop down; the one you are in is tinted and ticked |
| ✅ | In the header, in the phone menu (which had no language control at all) and in the footer |
| ✅ | Each line is still a real link to the same page in the other language, so Google, middle-click and the back button all still work |
| ℹ️ | The flags are the real artwork, shipped as two files rather than emoji: Windows has no flag glyphs and would have shown the letters "IL" and "US" |

### Materials

| | |
|---|---|
| ✅ | **חומרים** in the admin: photo, name, English name, one line, explanation, published, order |
| ✅ | The four materials the site was built with move into it, with their photographs, so they can be edited too |
| ✅ | /materials shows every material in one identical composition: photo on one side at 380px, name and explanation on the other |
| ✅ | The old per-material addresses now land on that material, so nothing indexed breaks |
| ✅ | The home-page strip and the "שווה לדעת" page read the same list, so a new material shows up in all three places at once |

### Products

| | |
|---|---|
| ✅ | **חומרים** on a product is a list to tick, not a box to type in |
| ✅ | **מידות** is a row per measurement: the name of it, then the measurement |
| ✅ | The name moved above the photo, set from the left, with the tagline and price under it |
| ✅ | The photo column is narrower, and stays put while you read down the page |
| ✅ | **על המוצר**, **מידות** and **חומרים** are one and the same box now — a test holds them identical |
| ✅ | Each material in the box is a row with its photo, and clicking it jumps to that material and lights it up for a moment |

**One gap worth knowing:** the material's one-line tagline has no English
field, so the English site shows the Hebrew line under an English name. The
same is already true of product descriptions. Say the word and I will add it.

478 tests pass, and the site behaves the same before and after the script.

---

## Client polish — 15 September

```
████████████████████  done
```

Everything asked for is in. Two optional scripts in step 1 of
[ACTION.md](ACTION.md); the site does not need them to look right.

| | |
|---|---|
| ⚠️ | **The client's materials do not exist.** Nothing is saved in the database, and the admin has no materials screen. See step 2 of ACTION.md |
| ✅ | A small materials slider at the bottom of the home page, between projects and the club: a swatch and two lines each, arrows on a computer, swipe on a phone |
| ✅ | The club photo sits in a white frame, with rounded corners like the tiles |
| ✅ | Product names in English on the Hebrew site, exactly as typed — milo, Elba, tano trio |
| ✅ | Product pages show a square with the piece centred, the same square as the tile you clicked |
| ✅ | About page rebuilt — see below |
| ✅ | Checked in Hebrew and English, desktop and phone. 447 tests pass |

**The product photos.** All 47 were uploaded the day before the crop window
existed, so none of them was a square: small tables at the bottom of tall
photos, fire tables running edge to edge. Each one has been squared around its
furniture, at a consistent size, with the backdrop continued where the square
runs past the photo. The catalogue now reads as one set. Three lifestyle photos
with no plain backdrop keep a simple centre square. Anything uploaded through
the crop window from now on is shown exactly as framed.

The squared photos are also far lighter — 2MB for all fifty, where several
originals were nearly 2MB each.

**The About page.**

| | |
|---|---|
| ⛔ | Gone: "מה אנחנו לא עושים" and its four lines, "של ישראל", "שלושתנו" and its line, the three names |
| ✅ | New opening line: **הבית לא נגמר בדלת.** |
| ✅ | New closing line: **את הבד צריך לגעת. על הספה צריך לשבת.** — then the showroom address and a real button |
| ✅ | The paragraph under the opening line is larger (up to 22px) and full black, beside the headline instead of in a narrow column |
| ✅ | Uses the page's width: a wide dusk-terrace photo, the name story beside a close-up of an aluminium frame, then the portraits |
| ✅ | The portraits stay, now as the three steps of making a piece: measure and plan, choose materials, see it through |

**Also fixed on the way:** on a phone the club's email box was half the height
of its button. And the product page's buttons were still the old square shape.

**Worth knowing:** the portraits have the names drawn into them in handwriting
(idan, roy, ben). They are part of the drawings, so they stay unless you want
them erased.

---

## Home page — 10 September

```
████████████████████  done
```

Everything asked for is in. One short script left before it is all on screen —
step 1 of [ACTION.md](ACTION.md), the stock numbers.

### The landing

| | |
|---|---|
| ✅ | The English line under the ALUMA logo is gone |
| ✅ | Scrolling off it is smooth now. The photo had been travelling *up* faster than the page, which is backwards and is what made it feel out of place; it lags behind now, and the wordmark fades out before the next section arrives |

### Light and matter

| | |
|---|---|
| ✅ | One prism, one beam, one spectrum — and its background is exactly the page's white with the edges feathered out, so it sits on the page rather than being a picture of something |
| ✅ | Crystal white section, picture left at 400px, words right, headline on one line |
| ✅ | The paragraph is on your three lines. Those breaks live in the copy, so you can move them yourself from **ניהול טקסטים** |
| ✅ | The photo sits 50px lower against the words |
| ✅ | Dust drifting in the air: sixteen specks, about a pixel a second. Invisible until you stop and look, and they stop entirely for anyone who has asked their computer for less motion |

### Collections and products

| | |
|---|---|
| ✅ | "קולקציות חמות" and "מוצרים מובילים" |
| ✅ | Hovering one tile softly blurs the others instead of washing them out, and the one you are on grows for longer |
| ✅ | Collection names ride a white plate across the foot of each photo, with the arrow on hover |
| ✅ | **The band behind them is a shade deeper.** You were right that white on it did not read — see below |
| ✅ | The "חדש" tag is terracotta with a slow sheen, squared rather than a pill |
| ✅ | Products can carry a stock count; at 5 or fewer an orange line appears under the photo |
| ↩️ | All 47 product names were made Hebrew — undone on 15 September at the owner's request |
| ⛔ | The flame icon is gone. Three versions in it still was not earning its place |

### Projects, club, and everything

| | |
|---|---|
| ✅ | Projects show a year after the place |
| ✅ | The two project buttons swapped, and both are the same pill as the account button in the header |
| ✅ | Every button on the site is one height, one radius, one typeface |
| ✅ | The club field keeps its round corners when you click into it, and the "unsubscribe any time" line is gone |

**Why the band changed.** White on it measured 1.06:1 — invisible. I measured
the shipped CSS of eight comparable brands: Vitra, Paola Lenti, Neptune, Aesop
and DWR all sit between 1.17:1 and 1.21:1 against white. Aluma was below every
one of them, which is why a white plate on it disappeared. The plate was fine;
the band was too pale. It is 1.17:1 now, and a test holds it there.

**Not touched:** every other page, as asked. The one exception is the shared
button shape, which by its nature applies everywhere. The contact form's
underline fields are still underlines rather than pills — say the word and
they change too.

**Next:** the other screens.

---

## The bug sweep — 9 September

```
████████████████████  done
```

**Every problem found has been dealt with.**

## What was done

14 agents tried to break every page. A second round tried to prove each finding
wrong. That produced **246 candidates**, and every one of them has now been
either fixed, ruled out, or consciously left with a reason (listed at the
bottom).

The sweep ran out of budget twice, which left 24 findings judged by nobody —
including the whole photo-crop tool. I went through those by hand. Two of them
were real breakages.

---

## Fixed

| | Area | What was wrong |
|---|---|---|
| ✅ | **Home page** | English pages painted in Hebrew first; hero tagline field did nothing |
| ✅ | **Collections** | A stray `%` in a link crashed the whole site; a dropped connection looked like an empty shop |
| ✅ | **Products** | Clicking a related item could show the wrong product's photos under the right name |
| ✅ | **Hidden collections** | Turning a collection off left all its furniture live and browsable |
| ✅ | **Projects** | The six fake projects flashed on every visit; broken images |
| ✅ | **Contact form** | Entirely Hebrew on the English site; a failed send locked you out for 30 seconds |
| ✅ | **Q&A** | Screen readers read every answer aloud while they were closed |
| ✅ | **Club & account** | No way back in if you forgot your password; progress bar filled backwards |
| ✅ | **English names** | The field you fill in never appeared anywhere on the site |
| ✅ | **"View in your space"** | Every 3D model was dead — hidden, one switch brings it back |
| ✅ | **Questionnaire** | Accepted a blank name and a fake phone; Enter did nothing |
| ✅ | **Every button** | Text on the terracotta buttons was below the readable minimum |
| ✅ | **Magazine** | An article with an email address in it lost all its paragraphs |
| ✅ | **Accessibility panel** | Keyboard users fell out of it; its text-size button did nothing |
| ✅ | **Photo cropping** | Resizing the window threw away the crop you had just set |
| ✅ | **Admin — products** | A half-failed save could create a duplicate product and duplicate every colour |
| ✅ | **Admin — the rest** | A failed save wiped the live home strip; "new question" discarded unsaved edits |
| ✅ | **Speed** | Every visitor downloaded a 360KB chart library used only by one admin screen |

---

## The production check

Not part of the sweep — the things that decide whether a site is safe to hand
over.

| | Checked | Result |
|---|---|---|
| ✅ | Passwords & keys | None in the code. The private key is only ever read from the server's own settings |
| ✅ | Who can read your data | Tested against the live database with the public key: enquiries are refused outright; customer profiles, orders and questionnaire answers all come back empty |
| ✅ | Google | Every address in the sitemap is a real page; the private pages now tell search engines to skip them |
| ✅ | Deep links | Sharing a link to any page works, including links with a `#` in them |
| ✅ | Every page loads | New test mounts all 23 public pages with an empty database and checks the browser console is clean |
| ✅ | Speed | 106KB of dead weight removed from every first page load |

---

## Deliberately left

About twenty small things, none of which a visitor can see:

- **Stale comments** in the code describing behaviour that has since changed.
  Worth tidying one day; harmless now.
- **A few search-engine tags** on the English pages that say "Hebrew". The
  effect is nil — the same tag is already set correctly elsewhere on the page.
- **English titles for projects and magazine posts.** The database has room for
  them and the admin has no field, which matches your "one name is enough".

---

## What you need to do

Nothing here — it was all my side.

Your list is in **[ACTION.md](ACTION.md)**: reviews, colours, real projects.
