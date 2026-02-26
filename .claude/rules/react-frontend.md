---
paths: "src/**/*.{ts,tsx}"
---

# React Frontend Rules

- React 19 with functional components only
- Use shadcn/ui components from `@/components/ui/` - do NOT install other UI libraries
- Style composition: `cn()` from `@/lib/utils` (clsx + tailwind-merge)
- Icons: `lucide-react` only
- Routing: `react-router-dom` v7
- All user-facing text must be in Japanese
- CSS: Tailwind CSS 4 utility classes, theme tokens defined in `src/index.css` as oklch CSS variables
