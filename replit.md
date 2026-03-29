# VAULT-TEC — Dossiê Operacional NEEXT

## Project Overview
A Fallout-themed personnel management web app (in Portuguese) built with React + Vite + TypeScript. Uses Supabase for authentication (email/password only) and an external REST API for cargo/role data. The UI features a retro terminal aesthetic.

## Architecture
- **Frontend only** — pure React SPA (no server-side code)
- **Auth**: Supabase (`@supabase/supabase-js`) — URL and anon key are hardcoded in `src/lib/supabase.ts`
- **Data**: External REST API at `api.neext.online` for FBI and SKUR cargo lists
- **Routing**: React Router v6 with HashRouter — Login at `#/login`, app at `#/`
- **UI**: Tailwind CSS + shadcn/ui + Radix UI + Framer Motion
- **State**: TanStack Query + React hooks

## Key Files
- `src/lib/supabase.ts` — Supabase client config + external API base URLs
- `src/hooks/useAuth.ts` — Authentication logic (sign up, sign in, reset password)
- `src/hooks/useCargos.ts` — Fetches cargo lists from external API
- `src/App.tsx` — HashRouter setup with routes: `/login` → Login, `/` → Index
- `src/pages/Index.tsx` — Main dashboard (redirects to `/login` if not authenticated)
- `src/pages/Login.tsx` — Login/register page
- `src/components/` — Vault-themed UI components (header, sidebar, login, cargo lists, chat, etc.)
- `src/components/VaultChat.tsx` — Real-time chat component (polls every 2.5s); supports send, reply, edit, soft-delete
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
