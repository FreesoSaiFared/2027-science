# Web Publication Runtime

The runtime is inspired by EPUB3/Readium but web-native. Baseline content is clean HTML/Markdown-derived HTML. Enhancements use CSS Custom Highlight API, Popover API, dialog, Anchor Positioning, scroll-driven animations, View Transitions, Navigation API, Declarative Shadow DOM, WASM, WebGPU, and built-in AI only when detected.

Layer order: CSS-first rendering; native overlay/highlight; interaction sensor; annotation; AI; graphics/WASM/WebGPU.
