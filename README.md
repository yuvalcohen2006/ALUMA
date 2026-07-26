# Aluma — outdoor furniture site

Luxury outdoor-furniture marketing site, customer club, and admin CMS.
**Stack:** React + Vite + TypeScript + Tailwind + Supabase.

## Local setup

```bash
npm install

# First run only: create your local env file, then paste your Supabase anon key into it.
cp .env.example .env      # (Windows PowerShell: copy .env.example .env)

npm run dev               # → http://localhost:8080
```

The app needs three Supabase env vars (see `.env.example`). `VITE_SUPABASE_URL`
and `VITE_SUPABASE_PROJECT_ID` are already filled in; you only need to add the
**anon / public key** from your Supabase dashboard (Project Settings → API).
Without a valid key the app still loads, but auth, the newsletter, the admin
panel, and any database call will fail.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload (localhost:8080) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build (localhost:4173) |
| `npm run lint` | ESLint |
| `npm test` | Run the test suite once (Vitest) |

## Deploying & database setup

See [GUIDE.md](GUIDE.md) for going live, applying Supabase migrations, and
making yourself an admin.
