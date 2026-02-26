---
name: fix-issue
description: Analyze and fix a GitHub issue
disable-model-invocation: true
---

Analyze and fix the GitHub issue: $ARGUMENTS.

1. Use `gh issue view $ARGUMENTS` to get the issue details
2. Understand the problem described in the issue
3. Search the codebase for relevant files
4. Implement the necessary changes to fix the issue
5. Write tests to verify the fix (follow patterns in `tests/api/`)
6. Run tests: `npx vitest run`
7. Run lint: `npm run lint`
8. Run build: `npm run build`
9. Create a descriptive commit message
10. Push and create a PR with `gh pr create`
