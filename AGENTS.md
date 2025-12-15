# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router routes (public store + admin). `app/api/` holds server routes and cron jobs; `app/admin/` the dashboard. 
- `components/` and `lib/`: shared UI and utilities (email, jobs, middleware, logging, Redis helpers). Keep new primitives reusable here. 
- `prisma/`: `schema.prisma` plus migrations. Update schema before coding features that touch data. 
- `tests/`: Vitest suites grouped by domain (`api`, `components`, `integration`, `security`, `performance`, etc.). Mirror new features with matching folders. 
- `public/` for static assets, `docs/` for longer-form docs, `styles/` for global Tailwind CSS.

## Build, Test, and Development Commands
- Install: `pnpm install` (preferred). 
- Run dev server: `pnpm dev` at `localhost:3000`. 
- Type check and lint: `pnpm type-check`, `pnpm lint` (`pnpm lint:fix` to autofix). Keep both clean before pushing. 
- Build/start: `pnpm build` then `pnpm start`. 
- Tests: `pnpm test` (all), `pnpm test:watch`, `pnpm test:coverage`, or scope (e.g., `pnpm test tests/api`). 
- Database: `pnpm db:migrate` for dev migrations, `pnpm db:seed` or `pnpm seed` to load sample data. 
- i18n: `pnpm i18n:seed` to refresh translations; `pnpm i18n:status` for a quick health check.

## Coding Style & Naming Conventions
- TypeScript-first; favor functional components and hooks. Prefer named exports; keep files focused. 
- Components/pages use `PascalCase`; functions, hooks, and variables use `camelCase`; constants `SCREAMING_SNAKE_CASE` only when shared. 
- Follow Next.js App Router patterns: colocate route handlers under `app/.../route.ts` and client components with `"use client"`. 
- Tailwind for styling; reuse tokens/classes instead of inline styles. Maintain small, composable UI pieces. 
- Formatting is enforced via `next lint`; align imports and avoid unused vars. Keep indentation consistent with surrounding files.

## Testing Guidelines
- Framework: Vitest with React Testing Library and jsdom/happy-dom. 
- Place specs alongside domain folders in `tests/` using `*.test.ts`/`*.test.tsx`. 
- Aim to extend existing coverage; add new suites when touching API routes, components, or hooks. 
- Run `pnpm test` + `pnpm type-check` + `pnpm lint` before PRs; for risky changes include `pnpm test:coverage`. 
- For DB-affecting tests, prefer factories/fixtures over live mutations; reset via provided helpers in `tests/helpers`.

## Commit & Pull Request Guidelines
- Recent history favors short, imperative summaries (e.g., `middleware fixed`). Follow that style or `feat/fix/chore(scope): message` if extra clarity helps. 
- One logical change per commit; include migration or seed notes in the message when relevant. 
- PRs should describe scope, risks, and validation steps. Link issues when available; attach screenshots/GIFs for UI work. 
- Call out env changes (`env.example.txt`, `ENV_VARIABLES_REQUIRED.md`) and database migrations. Note any test commands executed.

## Security & Configuration
- Never commit secrets; copy `env.example.txt` to `.env` and keep sensitive values local. 
- Prisma migrations live in `prisma/migrations`; run `pnpm db:migrate` before pushing schema changes. 
- Sentry/analytics hooks exist in `instrumentation*.ts` and `app/layout.tsx`; preserve tracing imports when editing. 
- Review middleware and rate limiting in `middleware.ts` and `lib/redis.ts` before altering auth or caching behavior.
