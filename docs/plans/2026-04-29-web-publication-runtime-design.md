# 2027.science Web Publication Runtime Design

The user supplied an explicit START NOW design brief; this document records the working design treated as approved for this dense bootstrap slice.

## Recommended approach

Build a minimal SvelteKit + Cloudflare Worker application that keeps article source semantic and layers behavior progressively. The baseline must read as normal HTML. Modern browsers add native highlights, popovers, dialog/anchor overlays, scroll-driven animation, view transitions, and local-only Mask state. Chrome Canary unlocks author-lab experiments but is never required for reading.

## Alternatives considered

1. Heavy app shell with a custom document model: powerful, but too much framework swamp for a first vertical slice.
2. Static Markdown publication only: safe, but misses the web-native runtime objective.
3. Progressive SvelteKit runtime: best fit. It keeps clean HTML, uses CSS/browser primitives first, and exposes Cloudflare-native server routes only where useful.

## Design

- Framework: SvelteKit, TypeScript, Vite, Cloudflare adapter.
- Hosting: Cloudflare Worker/static assets; tunnel is for lab preview and local origin experiments only.
- Layers: CSS rendering, native overlay/highlight, interaction sensors, annotations, AI/provider adapters, graphics/WASM/WebGPU as optional advanced layer.
- Capability database: seed JSON plus feature detection code; `/system-check` displays detections and derives a reader tier.
- Reader demo: semantic article enhanced by Custom Highlight API, Popover API, Anchor Positioning, scroll timelines, and View Transitions with fallbacks.
- Mask: local pseudonymous profile with explicit controls; no server upload by default.
- Provider Scout: provider registry, local/mock smoke testing, env-presence only, no secret printing.
- Observatory: privacy-first skeleton with explicit redacted donation routes and revocation.

## Testing

Pure TypeScript modules get unit tests first: tier derivation, Mask TOML round trip, provider routing. Svelte routes are verified through SvelteKit check/build. Ops are verified through a shell script that reports local tooling/DNS/tunnel state without mutating DNS.
