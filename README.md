# 2027.science

𓇼⚡📜 **2027.science · The Canary Codex** 🔭🧪

SvelteKit-first, Cloudflare-native interactive publication runtime for `2027.science`.

This is a browser laboratory disguised as a publication: semantic text remains the source of truth, then progressively gains browser-native highlights, popovers, anchor-positioned overlays, scroll-driven animation, View Transitions, local Mask profiles, optional Observatory donations, provider scouting, and generated design ingestion.

## Vision

This is not just another website. It is a living laboratory where each page can use the browser primitives that best serve the reading experience:

- **Dynamic technology selection**: each route uses the smallest stack that fits its purpose.
- **Native-first interaction**: Custom Highlight API, Popover API, Dialog, View Transitions, scroll-driven animation, container queries, `:has()`, and other platform features before heavy JavaScript.
- **Canary-grade experiments**: WebGPU, built-in AI APIs, EditContext, Navigation API, and other emerging capabilities are detected before use.
- **Cloudflare deployment path**: Workers/static assets via SvelteKit and Wrangler.
- **Privacy by default**: local Mask state, consent-first Observatory donation, no client-side provider secrets.

> Every page is a canvas, every technology a brush, every boundary meant to be tested safely.

## Commands

```bash
npm run dev
npm run check
npm run build
npm run test
npm run lint
npm run ops:check
npm run flags:canary
```

## Deployment model

- Production target: Cloudflare Workers/static assets via `@sveltejs/adapter-cloudflare` and Wrangler.
- Tunnel role: local lab preview and special origin experiments, not the only production dependency.
- Secrets: environment variables only; never write tokens into repository files.
- Best browser target: Chrome Canary, with graceful fallback for stable browsers.

See `docs/` for architecture, operations, DNS/tunnel, Mask, Observatory, Provider Scout, and capability database notes.

## Design inbox

Drop generated construction-sheet sidecar manifests into `design-inbox/`. The first safe pipeline uses JSON only:

```bash
npm run design:ingest -- design-inbox/example.manifest.json
```

It writes a generated Svelte route under `src/routes/generated/<slug>/+page.svelte` for human review. It does not slice images, run OCR, call AI services, deploy, or mutate DNS.

## Current routes

- `/`
- `/system-check`
- `/reader-demo`
- `/mask`
- `/privacy`
- `/observatory`
- `/provider-scout`
- `/generated`
- `/generated/night-lab-reader`
