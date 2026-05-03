# Architecture

2027.science is a SvelteKit Cloudflare Worker app built with TypeScript, Vite, Wrangler, and `@sveltejs/adapter-cloudflare`. Article HTML stays semantic; runtime behavior is layered: CSS rendering, native overlays/highlights, interaction sensors, annotations, AI/provider adapters, optional graphics/WASM/WebGPU, and manifest-driven generated design routes.

## Canonical runtime routes

- `/` — project landing page for `𓇼⚡📜 2027.science · The Canary Codex 🔭🧪`.
- `/system-check` — browser capability probe for Custom Highlight API, Popover API, Anchor Positioning, Scroll-driven Animations, View Transitions, Navigation API, Declarative Shadow DOM, WASM, WebGPU, CSS modern primitives, and Chrome AI APIs when detected.
- `/reader-demo` — semantic article demo with progressive native highlights, popovers, anchor-positioned overlays, scroll-linked marginalia, and view-transition state changes.
- `/mask` — local-first pseudonymous Mask editor and panel.
- `/privacy` — consent, storage, and no-secrets privacy defaults.
- `/observatory` — opt-in discovery and source-quality skeleton.
- `/provider-scout` — provider registry and smoke-test policy surface for OpenRouter, NVIDIA NIM, Workers AI, LM Studio, llama.cpp, Ollama, and mock providers.
- `/generated` — sidecar-first image-to-site route index.
- `/generated/night-lab-reader` — sample generated route from `design-inbox/example.manifest.json`.

Shared navigation lives in `src/routes/+layout.svelte`; route implementations live under `src/routes/**/+page.svelte`. Cloudflare Worker output is produced by the SvelteKit adapter during `npm run build`.

## Image-to-site design inbox

`design-inbox/` is the safe ingress for GPT Image / generated UI construction sheets. Version 1 does not OCR, crop, or trust pixels. A sidecar `*.manifest.json` describes Zone A (final mockup, do not slice), Zone B (asset sprite board entries such as `E001`), and Zone C (layout/theme/interactions/CSS features). Run `npm run design:ingest -- design-inbox/example.manifest.json` to generate a reviewable Svelte route under `src/routes/generated/<slug>/+page.svelte`.

Supporting directories are committed as empty contracts:

- `design-processed/` for reviewed inputs that have been accepted.
- `design-rejected/` for unsafe, unclear, duplicate, or out-of-scope inputs.
- `static/generated/` for future static generated assets after review.

Future image slicing can be added behind this manifest contract.

## Provider Scout boundary

Provider Scout keeps keys out of the browser. The public `/provider-scout` route shows registry metadata and routing policy only. Actual hosted smoke tests belong in server routes, cron jobs, or operator scripts after explicit Mask consent and server-side secret configuration. Local providers use localhost model-list probes; the mock provider covers offline tests.
