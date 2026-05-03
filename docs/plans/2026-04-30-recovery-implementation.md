# 2027.science Recovery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the first recoverable SvelteKit/Cloudflare living publication shell without deploying.

**Architecture:** Continue the existing SvelteKit app. Fill the missing design-inbox generator with pure TypeScript plus a CLI wrapper, then verify existing pages and modules.

**Tech Stack:** SvelteKit, TypeScript, Vite, Vitest, Wrangler, Cloudflare adapter.

---

### Task 1: Inspect and classify workspace

- Confirm cwd, files, git status, package.json, SvelteKit/Cloudflare config.
- Stop if wrong directory; otherwise continue existing project.

### Task 2: Add design ingestion red test

- Create `src/lib/design/manifest.test.ts`.
- Test slug sanitization, manifest parsing, and route generation safety.
- Run targeted Vitest and confirm it fails because implementation is missing.

### Task 3: Implement design ingestion

- Create `src/lib/design/manifest.ts`.
- Create `scripts/ingest-design-manifest.mjs`.
- Create `design-inbox/.gitkeep` and `design-inbox/example.manifest.json`.
- Add `design:ingest` package script.

### Task 4: Verify

- Run targeted unit tests.
- Run `npm run test:unit -- --run`.
- Run `npm run check`.
- Run `npm run build`.
- Run `npm run ops:check`.
