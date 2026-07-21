# Night fixes — design overhaul

Everything you asked for, done across the **whole project**. Build passes. To see it: `npm run dev` → http://localhost:8080.

---

## The palette (implemented everywhere)
Locked to your text message and applied through the design tokens, so it cascades to every screen:
- **Terracotta #C77962** → primary: buttons, large display titles (on light backgrounds only), accents, dividers, icons.
- **Warm white #F8F6F2** → main background. **Sand beige #E9DFD2** → secondary sections/panels/cards. **No gradients between them** — the old cream→cream gradient utility is now a solid fill, and I killed the sand↔warm-white gradients on the newsletter, AR, and fabric panels. Clean edges only.
- **Charcoal #2F2F2F** → all running text, headings on sand, small text, and the footer/mobile bar background. It's the workhorse (12:1 contrast on warm-white).
- **Olive-grey/teal → dropped entirely.** Every place that used the old green now uses terracotta (hover states) or charcoal.

**Contrast note (why some things are charcoal, not terracotta):** terracotta is a mid-tone — it only has enough contrast for *large* titles on *warm-white*. On sand it fails, and at small sizes it fails. So the rule I applied everywhere: **terracotta = big titles on light + buttons/accents; charcoal = all body text + any title sitting on sand + small text.** That's why your "running text blends" problem is gone — it's all charcoal now.

## Typography
- **Titles → Heebo, light weight** (big + airy). **Body → Assistant, normal weight** (readable, doesn't blend). Frank Ruhl removed.
- **Italic enabled** — I removed the old hard override that was force-killing every italic, so the accent words already marked italic across the site now actually render italic. (Heads-up: Hebrew fonts don't ship true italics, so it's a synthesized slant — tell me tomorrow if you want it kept, restyled, or reserved for the Latin bits.)

## Landing page (what you called out)
- **Slogan under the logo** → was terracotta on a warm background (blended). Now **charcoal**, reads clearly.
- **Scroll cue** → three downward chevrons under the hero text that **fade in one-by-one after the text**, then gently nudge down to signal the page scrolls. Clicking them scrolls down. (Respects reduced-motion.)
- **"הסיפור שלנו / Our Story"** → removed the **English label and the little circle** — and I did that in the shared `SectionLabel`, so **every section** across the site lost its English + dot (you said fix it project-wide).
- **Divider** → the "line–diamond–line" motif is gone; it's now a single clean minimal line.
- **Body text there** → charcoal, normal weight, larger — no more blending into the white.
- **Category icons** → the tiny pixelated PNGs that "popped" on hover now sit in clean bordered **tiles** with a subtle lift + gentle scale on hover. Much more intentional (I can't re-render the source 3D art, but the presentation is fixed).

## Circles — gone
You didn't want to see them anywhere. **Zero `rounded-full` left in the app code.** Decorative ones (dots, the SectionLabel circle, gradient orbs, rotated diamonds) were deleted; functional round controls (FABs, nav arrows, badges, icon buttons, the WhatsApp/a11y buttons) are now `rounded-sm` to match the site's angular language. (Only the shadcn toggle/progress primitives keep a radius internally — invisible to users.)

## Accessibility
Checked it — it's decent (text-size, high-contrast, highlight/underline links, readable font; keyboard-operable; persists; reachable on mobile via the bottom bar). I improved two things:
- **High-contrast mode** was a crude CSS filter → now a real token override (true black-on-white, darker borders, darker terracotta).
- The floating a11y button was a circle → now `rounded-sm`.

## Footer / mobile bar
Now **charcoal background with warm-white text** (was low-contrast white-on-terracotta). Premium + readable (~12:1).

## Whole-project sweep
I ran a pass over **every remaining screen** (all catalog, detail, blog, club/auth, the AR/sofa/fabric tools, and the whole admin) applying the same rules: de-circled, killed neutral gradients, moved body/small/on-sand text to charcoal, lightened big-title weights. So the whole thing is consistent, not just the landing page.

---

## For tomorrow / your call
- **The rail under the category icons** — you said we'd do that one together tomorrow, so I left it.
- **Italic** — decide if you like the synthesized Hebrew slant (see note above).
- **Terracotta titles** are AA-compliant for large text on warm-white but are inherently a soft mid-tone; if you ever want punchier titles, charcoal titles with terracotta accents is the higher-contrast option.
- Real project/testimonial photos and the Supabase login/migrations (from `GUIDE.md`) are still the outstanding non-design items.

Everything's committed in small steps, so anything here is easy to revert or tweak.
