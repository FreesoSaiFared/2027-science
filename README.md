# 2027.science

SvelteKit-first, Cloudflare-native interactive publication runtime for `2027.science`.

The site treats normal semantic text as the source of truth, then progressively adds browser-native highlights, popovers, anchor-positioned overlays, scroll-driven animation, View Transitions, local Mask profiles, optional Observatory donations, and provider scouting.

## Commands

```bash
npm run dev
npm run check
npm run build
npm run test:unit -- --run
npm run ops:check
npm run flags:canary
```

## Deployment model

- Production target: Cloudflare Workers/static assets via `@sveltejs/adapter-cloudflare` and Wrangler.
- Tunnel role: local lab preview and special origin experiments, not the only production dependency.
- Secrets: environment variables only; never write tokens into repository files.

See `docs/` for architecture, operations, DNS/tunnel, Mask, Observatory, Provider Scout, and capability database notes.

## Design inbox

Drop generated construction-sheet sidecar manifests into `design-inbox/`. The first safe pipeline uses JSON only:

```bash
npm run design:ingest -- design-inbox/example.manifest.json
```

It writes a generated Svelte route under `src/routes/generated/<slug>/+page.svelte` for human review. It does not slice images, run OCR, call AI services, deploy, or mutate DNS.
