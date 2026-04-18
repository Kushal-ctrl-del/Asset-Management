# ABC College Student Portal

A frontend-only React 18 + Vite + TypeScript student management system for ABC College.

## Run locally

```bash
pnpm install
pnpm --filter @workspace/abc-college-portal run dev
```

## Build

```bash
pnpm --filter @workspace/abc-college-portal run build
```

## Demo credentials

- Student: student@abc.edu / student123
- Faculty: faculty@abc.edu / faculty123
- Admin: admin@abc.edu / admin123

## Storage behavior

All persistent app data is seeded from `src/data/*.json` into browser localStorage on first load only. Login tokens and temporary UI state use sessionStorage unless Remember Me is enabled, which stores the login token in localStorage. Changes to users, profile, notifications, leave requests, fees, assignments, documents, and book requests persist across refreshes.
