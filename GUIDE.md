# Aluma — Where we are & how to ship it

Short, practical answers to everything you asked.

---

## 1. Score: 5/10 → **~7.5/10**

**Why it went up:** the site is now *functional, honest, accessible, and cleaner*. The admin panel is unlocked, dead links and fake content are gone, tracking is consent-gated, ~60 dead files + 27 unused packages were removed, the design tokens are coherent, contrast passes AA on the elements that matter, and the biggest AI "tells" (gradient orbs, em-dashes, one-font-pretending-to-be-two) are handled. It builds clean every time.

**Why it's not 9+ yet (and what's left):**
- **Real content** — the project portfolio + before/after photos are still recycled catalog renders, and there are no real testimonials. This needs *you* (photos/quotes); I won't fake them.
- **Feature depth** — the AR viewer uses generic demo 3D models, and the sofa designer / fabric configurator are visual-only (no real spec output). Real work, not a quick fix.
- **The bespoke visual identity** — we deliberately deferred the full look-and-feel (palette direction, layout personality) to our design conversation. The current palette is a solid, safe cream+terracotta; making it *unmistakably Aluma* is the next creative step.
- **Plumbing** — no SSR (so link-previews on WhatsApp/FB fall back to the homepage), no real test suite, some pre-existing `any`-typing debt in the admin code.

So: it went from "impressive-looking but broken and generic" to "genuinely solid and trustworthy, ready for a real design identity."

---

## 2. Can I just `npm run dev` and see the changes?

**Yes — but "dev" is local only (your machine), not online.**

```bash
npm install       # once (dependencies are already installed, but safe to re-run)
npm run dev
```

Then open **http://localhost:8080** in your browser. That's the live app with all my changes — only you can see it. It hot-reloads as files change.

- `npm run dev` = private preview on your computer.
- **Online = a deploy** (section 3). There's no "npm run dev but public" — putting it online means building it and hosting it somewhere.
- If you want a quick production-accurate local check: `npm run build && npm run preview` (serves the real built site at localhost:4173).

---

## 3. Getting this online (click-by-click)

There are two realistic routes. **Do the database step first either way.**

### Step A — Apply the 2 new database migrations (required)

I added two SQL migrations the live database doesn't have yet. Without them, the **admin panel stays locked** and the **newsletter errors out**. Easiest way (no command line):

1. Go to **supabase.com** → log in → open your project (`yvxynsonjmcppaxflmvz`).
2. Left sidebar → **SQL Editor** → **New query**.
3. Open the file `supabase/migrations/20260721120000_fix_admin_access.sql` from this project, copy its contents, paste, click **Run**.
4. New query again → do the same with `supabase/migrations/20260721120100_newsletter_subscribers.sql` → **Run**.
5. You should see "Success." That's it.

### Step B — Make yourself an admin (required to use the CMS)

The first admin has to be set by hand. After you've signed up on the site once (so your account exists):

1. Supabase → **SQL Editor** → New query, run this to find your user id:
   ```sql
   select id, email from auth.users order by created_at desc;
   ```
2. Copy your `id`, then run:
   ```sql
   insert into public.user_roles (user_id, role) values ('PASTE-YOUR-ID', 'admin');
   ```
3. Now `/admin` works for you.

### Step C — Publish the site

**Route 1 — Lovable (simplest if this project lives in Lovable):**
1. Push these local changes to the GitHub repo Lovable is connected to (Lovable syncs with GitHub — if you're unsure whether this folder is connected to a remote, tell me and I'll help wire it up; right now it's a fresh local git repo with no remote).
2. In Lovable, click **Publish** (top right).
3. Lovable → **Settings → Domains** → add `alumaoutdoor.com` and follow its DNS instructions.

**Route 2 — Vercel or Netlify (works for any Vite app, very beginner-friendly):**
1. Put this project on GitHub (I can set that up for you in one step).
2. Go to **vercel.com** (or netlify.com) → **Add New Project** → import the repo.
3. It auto-detects Vite. Under **Environment Variables**, add the three from your `.env`:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Click **Deploy**. You get a live `*.vercel.app` URL in ~1 min.
5. **Settings → Domains** → add `alumaoutdoor.com` → point your domain's DNS (at your registrar) to the records it shows.

> Tell me which route you want and I'll walk you through the exact clicks for your setup.

---

## 4. "There are a bajillion images in the folder — shouldn't those be in the database? I use Sanity normally."

Great question, and here's the mental model coming from Sanity:

| Sanity world | This project (Supabase) |
|---|---|
| Content documents (dataset) | **Supabase tables** (Postgres) |
| Image/file assets (Sanity CDN) | **Supabase Storage** (buckets) |
| GROQ queries | Supabase client `.from(...).select()` |

**Two important truths:**

**1. You never put image *files* inside the database itself.** Not in Sanity, not in Supabase. Databases store *text/data* (a product name, a URL). Image binaries go in a **file store** — Sanity has its asset pipeline; Supabase's equivalent is **Supabase Storage**. You store the *URL* in the table, the *file* in Storage.

**2. This project already does that — for the content you manage.** Every image you upload through the **admin panel** (collections, projects, hero, blog) already goes to **Supabase Storage** and the URL is saved in the table. That part works like Sanity already.

**So what are all those PNG/JPGs in `src/assets`?** Those are the **fixed brand assets** — the logo, the homepage hero, the category icons, the sofa-part illustrations, the material swatches. They're *bundled into the app when it builds* and served super-fast from the CDN. For images that basically never change, this is the correct, fastest approach — you don't want a database round-trip to load your logo.

**When would you move a `src/assets` image into Supabase Storage instead?** Only if you want to **change it without a developer/redeploy**. Example: if you want to swap the homepage hero yourself from an admin screen, it should live in Storage (the hero already can — check `/admin/hero`). The logo and icons are fine staying bundled.

**How to use Supabase Storage yourself (click-by-click):**
1. Supabase → left sidebar → **Storage**.
2. You'll see existing buckets (`site-hero`, `site-projects`, `blog-images`, `site-collections`). Click one → **Upload file**.
3. Click the uploaded file → **Get URL** (or "Copy URL"). That URL is what goes into a table/field.
4. In practice you'll do this *through the admin panel*, which handles the upload + URL for you — you rarely touch Storage directly.

**Bottom line:** you don't need to "move the images into the database." Dynamic content images are already in Supabase Storage; the bundled brand assets are correctly bundled. Nothing to fix here — it's set up right.

---

## 5. What I'd do next (your call)

1. Run it locally (`npm run dev` → localhost:8080) and look around.
2. Apply the two migrations + make yourself admin (section 3A/3B) so the CMS works.
3. Then hit me with the **design direction** — palette feel, references, the vibe — and we start making it unmistakably *Aluma*.
