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

**[docs/SETUP.md](docs/SETUP.md)** — architecture, running costs, the full
service setup walkthrough (Resend, Supabase, Cloudflare Pages), migrations,
edge functions and deployment. One document, everything in it.
