---
name: add-page
description: Add a new page/feature to the React frontend
disable-model-invocation: true
---

Add a new page to the beauty-app frontend: $ARGUMENTS.

1. Check existing page structure in `src/pages/`
2. Check existing components in `src/components/ui/` for reusable pieces
3. Check the API endpoints in `server/routes/` that the page will consume
4. Check shared types in `src/types/index.ts`
5. Create the page component in `src/pages/` using:
   - React 19 functional components
   - shadcn/ui components with `cn()` for styling
   - `lucide-react` icons
   - Japanese text for all user-facing content
6. Add route in the router configuration
7. Write component tests using `@testing-library/react`
8. Run tests: `npx vitest run`
9. Run build: `npm run build`
