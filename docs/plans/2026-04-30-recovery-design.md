# 2027.science Recovery Design

The workspace is already the canonical `2027-science` SvelteKit/Cloudflare project. Recovery continues the existing scaffold rather than recreating it.

## Approach options

1. Reinitialize from scratch: rejected because existing app, docs, tests, and lockfile already match the mission.
2. Continue existing SvelteKit project and fill gaps: selected because it preserves local changes and keeps the first vertical slice reviewable.
3. Split into a separate worktree: rejected for this immediate recovery because the repo has no commits yet and the user asked to work in this canonical directory.

## Design

Keep the existing progressive-enhancement architecture: semantic SvelteKit routes, CSS-first publication styling, browser capability detection, local-only Mask storage, Observatory privacy skeleton, and provider scout abstractions. Add the missing image-to-site ingress as a safe sidecar JSON generator: `design-inbox/*.manifest.json` becomes generated Svelte route files only under `src/routes/generated/<slug>/+page.svelte`; no OCR, OpenCV, image slicing, network, deployment, or DNS mutation.

## Testing

Pure logic remains unit-tested with Vitest. The new design manifest parser/generator gets a red test before implementation. Final verification runs unit tests, Svelte check, build, and the non-mutating ops check.
