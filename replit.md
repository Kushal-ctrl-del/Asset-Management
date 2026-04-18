# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Current App

- **ABC College Student Portal**: frontend-only React + Vite app at `artifacts/abc-college-portal` served at `/`.
- Persistent application data is stored in browser localStorage and seeded from `artifacts/abc-college-portal/src/data/*.json` on first load.
- Session login tokens and temporary UI state use sessionStorage, except Remember Me stores the token in localStorage.
- Demo credentials: `student@abc.edu / student123`, `faculty@abc.edu / faculty123`, `admin@abc.edu / admin123`.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Web app**: React 18, Vite, TypeScript, React Router, TailwindCSS, Framer Motion, Recharts, Sonner
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/abc-college-portal run dev` — run ABC College portal locally
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
