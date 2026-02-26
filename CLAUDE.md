# Beauty App - 美容院向け顧客・施術記録管理アプリ

## Project Overview

Cloudflare Pages上にデプロイされるフルスタックアプリ。Hono APIバックエンド（D1/R2）+ React 19フロントエンド。

- **Backend**: Hono v4 on Cloudflare Workers/Pages Functions
- **Frontend**: React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + shadcn/ui
- **Database**: Cloudflare D1 (SQLite), schema defined in `schema.sql`
- **Storage**: Cloudflare R2 (before/after photos)
- **Testing**: Vitest with in-memory D1/R2 mocks

## Commands

- `npm run build` - TypeScript check + Vite build
- `npm run lint` - ESLint
- `npm run test` - Run all tests
- `npm run test:api` - Run API tests only (node env)
- `npm run dev` - Vite dev server (frontend only)
- `npm run dev:full` - Build + Wrangler Pages dev (full stack)
- `npm run db:migrate:local` - Apply schema to local D1

**IMPORTANT**: 単体テスト実行時はファイル指定で実行する: `npx vitest run tests/api/customers.test.ts`

## Code Style

- ES Modules (import/export), NOT CommonJS
- Strict TypeScript (`noUnusedLocals`, `noUnusedParameters`)
- Path aliases: `@/*` → `./src/*`, `@server/*` → `./server/*`
- shadcn/ui "new-york" style, use `cn()` from `@/lib/utils` for class merging
- Japanese locale for date formatting (`ja-JP`)
- All user-facing text in Japanese

## Architecture

- `server/` - Hono API routes, middleware, DB queries
- `server/routes/` - Route handlers (customers, records, images)
- `server/db/schema.ts` - D1 prepared statement query helpers
- `src/` - React frontend
- `src/components/ui/` - shadcn/ui components
- `src/types/index.ts` - Shared TypeScript interfaces
- `functions/api/[[route]].ts` - Cloudflare Pages Functions entry point
- `tests/helpers/` - Mock D1/R2 for testing

## Testing

- API tests use `app.fetch(request, env)` pattern with mock bindings
- D1 mock: `tests/helpers/mock-d1.ts` (in-memory, no SQLite dependency)
- R2 mock: `tests/helpers/mock-r2.ts` (in-memory)
- Test descriptions and assertions are written in Japanese
- Do NOT use real Cloudflare bindings in tests

## Git Workflow

- Branch naming: `feature/xxx`, `fix/xxx`, `refactor/xxx`
- Commit messages in English, concise
- PR descriptions should include summary and test plan
