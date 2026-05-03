# Capability Database

Seed file: `data/web-platform-capabilities.seed.json`. Runtime detection: `src/lib/capabilities/detect.ts`. `/system-check` displays detections and derives tiers: reader-basic, reader-native-overlays, reader-native-animations, reader-canary-text-lab, reader-gpu-ai, author-lab.

The live detector now includes the full first-pass browser lab checklist: WebGPU, CSS Custom Highlight, Popover, Dialog, Anchor Positioning, Scroll-driven Animations, View Transitions, Navigation API, Declarative Shadow DOM, Sanitizer, EditContext, WASM/SIMD, Chrome built-in AI APIs, pointer/touch/reduced-motion/storage signals, CSS carousels, scroll-state queries, container queries, style queries, `@scope`, nesting, `:has()`, subgrid, and advanced typography.
