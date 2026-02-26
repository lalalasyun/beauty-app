# Cloudflare Platform Rules

- Deploy target: Cloudflare Pages with Functions
- `functions/api/[[route]].ts` is the catch-all entry point - do NOT modify structure
- D1 binding name: `DB`, R2 binding name: `BUCKET`
- Three environments: local, staging, production (defined in `wrangler.toml`)
- NEVER execute migration commands against production without explicit confirmation
- Local dev uses Wrangler's built-in Miniflare for D1/R2 emulation
