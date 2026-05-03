# Web Publication Runtime Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bootstrap 2027.science as a Cloudflare-native SvelteKit interactive publication runtime.

**Architecture:** Progressive enhancement: semantic HTML baseline, CSS-first publication styling, native overlay/highlight APIs where detected, local Mask state, and provider/observatory skeletons behind explicit consent. Cloudflare adapter and Wrangler provide Worker deployment; tunnel remains lab preview only.

**Tech Stack:** SvelteKit, TypeScript, Vite, Vitest, Playwright scaffold, @sveltejs/adapter-cloudflare, Wrangler, cloudflared examples.

---

### Task 1: Safety and scaffold

- Inspect cwd and siblings.
- Create `/home/ned/2027-science` with `sv create` minimal TypeScript + Cloudflare adapter + Vitest/Playwright/ESLint/Prettier.
- Initialize git.

### Task 2: Test pure runtime functions first

- Create tests for capability tier computation, Mask TOML round trip, and provider routing.
- Run tests and confirm failure because modules are missing.

### Task 3: Implement core libraries

- Create `src/lib/capabilities/*`, `src/lib/mask/*`, `src/lib/providers/*`, observatory skeletons.
- Keep modules browser-safe and secret-safe.

### Task 4: Implement routes and UI

- Create home, system-check, reader-demo, mask, privacy, observatory, docs routes.
- Use progressive enhancement and no heavy UI dependencies.

### Task 5: Ops and docs

- Add `wrangler.jsonc`, ops scripts/examples, Chrome Canary flag scraping skeleton, and documentation.

### Task 6: Verify

- Run `npm run check`, `npm run build`, `npm run test:unit -- --run`, and `npm run ops:check`.
- Fix obvious issues once and document remaining blockers.
