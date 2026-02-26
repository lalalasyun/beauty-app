---
paths: "server/**/*.ts"
---

# Hono API Rules

- All routes mount under `/api` prefix
- Use Hono's `Context` type with `Env` from `@/types`
- Access D1 via `c.env.DB`, R2 via `c.env.BUCKET`
- DB queries go in `server/db/schema.ts` as prepared statements
- Always use parameterized queries (`.bind()`) to prevent SQL injection
- Return `ApiResponse<T>` format: `{ success: boolean, data?: T, error?: string }`
- Error responses use appropriate HTTP status codes
- Image keys follow pattern: `records/{record_id}/{before|after}.{ext}`
