# Aluma — outdoor furniture site

Luxury outdoor-furniture marketing site, customer club, and admin CMS.

**Stack:** React + TypeScript + Vite + Tailwind · Supabase (database, auth,
photo storage) · Resend (email) · Cloudflare Pages (hosting).

## Local setup

```bash
npm install

# First run only: create your local env file, then paste your Supabase anon key into it.
cp .env.example .env      # (Windows PowerShell: copy .env.example .env)

npm run dev               # → http://localhost:8080
```

The app needs all three `VITE_SUPABASE_*` vars from `.env.example`. The
**anon / public** key comes from the Supabase dashboard (Project Settings →
API). Without it the Supabase client can't be created and the app won't mount.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload (localhost:8080) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build (localhost:4173) |
| `npm run lint` | ESLint |
| `npm test` | Run the test suite once (Vitest) |

## Everything else

- **[docs/NEXT-STEPS.md](docs/NEXT-STEPS.md)** — start here. Click-by-click
  walkthrough of the outstanding setup (Resend, Supabase keys, Cloudflare
  Pages) and what to do about the domain after 11 August.
- **[docs/SETUP.md](docs/SETUP.md)** — the reference: architecture, running
  costs, secrets, migrations, edge functions, deployment.

### Note on local development

`npm run dev` renders a 20-product **placeholder catalogue** on the collections
pages instead of the database, so layouts and filters can be judged against a
realistic amount of stock. It is development-only and never reaches production.
Append `?live=1` to any collections URL to see the real database instead.
