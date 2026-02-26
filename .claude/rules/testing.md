---
paths: "tests/**/*.ts"
---

# Testing Rules

- Use Vitest as the test runner
- API tests use `app.fetch(new Request(...), env)` pattern
- Create mock env with `MockD1Database` and `MockR2Bucket` from `tests/helpers/`
- Write test descriptions in Japanese
- Test CRUD operations: create, read, update, delete
- Test error cases: not found, invalid input, missing required fields
- Do NOT use real Cloudflare bindings or network calls
- Run single test files for speed: `npx vitest run tests/api/customers.test.ts`
