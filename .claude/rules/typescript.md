---
paths: "**/*.{ts,tsx}"
---

# TypeScript Rules

- Use strict TypeScript; do not use `any` type unless absolutely necessary
- Prefer `interface` over `type` for object shapes
- Use shared types from `@/types/index.ts` (Customer, TreatmentRecord, ApiResponse, Env)
- Destructure imports: `import { useState } from 'react'`
- Use path aliases: `@/` for src, `@server/` for server
