# VAULT-TEC — Dossiê Operacional NEEXT

## Project Overview
A Fallout-themed personnel management web app (in Portuguese) built with React + Vite + TypeScript. Uses Supabase for authentication (email/password and Google OAuth) and an external REST API for cargo/role data. The UI features a retro terminal aesthetic.

## Architecture
- **Frontend only** — pure React SPA (no server-side code)
- **Auth**: Supabase (`@supabase/supabase-js`) — URL and anon key are hardcoded in `src/lib/supabase.ts`
- **Data**: External REST API at `api.neext.online` for FBI and SKUR cargo lists
- **Routing**: React Router v6
- **UI**: Tailwind CSS + shadcn/ui + Radix UI + Framer Motion
- **State**: TanStack Query + React hooks

## Key Files
- `src/lib/supabase.ts` — Supabase client config + external API base URLs
- `src/hooks/useAuth.ts` — Authentication logic (sign up, sign in, Google, reset password)
- `src/hooks/useCargos.ts` — Fetches cargo lists from external API
- `src/pages/Index.tsx` — Main page (login screen or dashboard depending on auth state)
- `src/components/` — Vault-themed UI components (header, sidebar, login, cargo lists, etc.)
- `vite.config.ts` — Vite dev server configured for Replit (host `0.0.0.0`, port `5000`)

## Running the App
```
npm run dev
```
Starts Vite dev server on port 5000.

## Deployment
Static site deployment — build output goes to `dist/`:
```
npm run build
```

## Notes
- Migrated from Lovable to Replit: removed `lovable-tagger` plugin from Vite config
- Supabase Google OAuth redirect is set to `window.location.origin` (works automatically on any domain)
