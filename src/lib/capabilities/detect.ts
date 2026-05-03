import type { BrowserTier, CapabilityDetection, CapabilityStatus } from './types';

const simdProbe = new Uint8Array([
	0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b, 0x03,
	0x02, 0x01, 0x00, 0x0a, 0x0a, 0x01, 0x08, 0x00, 0xfd, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x0b
]);

const hasWindow = () => typeof window !== 'undefined';
const hasCss = () => typeof CSS !== 'undefined' && typeof CSS.supports === 'function';
const supports = (query: string) => hasCss() && CSS.supports(query);
const supportsSelector = (selector: string) =>
	hasCss() && 'supports' in CSS && CSS.supports(`selector(${selector})`);
const supportsRule = (rule: string) => {
	if (typeof CSSStyleSheet === 'undefined') return false;
	try {
		const sheet = new CSSStyleSheet();
		sheet.replaceSync(rule);
		return sheet.cssRules.length > 0;
	} catch {
		return false;
	}
};
const hasGlobal = (name: string) => hasWindow() && name in window;

export interface CssCapabilityProbe {
	supports: (query: string) => boolean;
	supportsSelector: (selector: string) => boolean;
	supportsRule: (rule: string) => boolean;
}

const browserCssProbe: CssCapabilityProbe = { supports, supportsSelector, supportsRule };

export function detectCssCapabilities(probe: CssCapabilityProbe) {
	return {
		cssCarousels:
			probe.supports('scroll-snap-type: x mandatory') &&
			(probe.supports('scroll-marker-group: after') || probe.supportsSelector('::scroll-marker')),
		scrollStateQueries: probe.supports('container-type: scroll-state'),
		containerQueries: probe.supports('container-type: inline-size'),
		styleQueries: probe.supportsRule(
			'@container style(--reader-mode: dense) { .reader { color: red; } }'
		),
		cssScope:
			probe.supportsSelector(':scope') &&
			probe.supportsRule('@scope (.reader) { p { color: red; } }'),
		cssNesting: probe.supportsRule('.reader { & p { color: red; } }'),
		hasSelector: probe.supportsSelector(':has(*)'),
		subgrid: probe.supports('grid-template-columns: subgrid'),
		advancedTypography:
			probe.supports('font-variant-caps: small-caps') &&
			probe.supports('text-wrap: pretty') &&
			probe.supports('font-size-adjust: 0.5')
	};
}

export function computeBrowserTier(d: CapabilityDetection): BrowserTier {
	const nativeOverlays = d.customHighlight && d.popover;
	const nativeAnimations = nativeOverlays && d.scrollDrivenAnimations && d.viewTransitions;
	const canaryTextLab = nativeAnimations && d.anchorPositioning && d.editContext;
	const gpuAi = d.webgpu && nativeAnimations && (d.languageModel || d.summarizer || d.translator);

	if (gpuAi && canaryTextLab) return 'author-lab';
	if (gpuAi) return 'reader-gpu-ai';
	if (canaryTextLab) return 'reader-canary-text-lab';
	if (nativeAnimations) return 'reader-native-animations';
	if (nativeOverlays) return 'reader-native-overlays';
	return 'reader-basic';
}

export async function detectCapabilities(): Promise<CapabilityDetection> {
	const nav = typeof navigator !== 'undefined' ? navigator : undefined;
	const storage =
		nav && 'storage' in nav ? await nav.storage.estimate().catch(() => undefined) : undefined;
	const media = hasWindow() && 'matchMedia' in window ? window.matchMedia.bind(window) : undefined;

	return {
		webgpu: !!nav && 'gpu' in nav,
		customHighlight: hasCss() && 'highlights' in CSS && hasGlobal('Highlight'),
		popover: typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype,
		dialog: typeof HTMLDialogElement !== 'undefined',
		anchorPositioning: supports('anchor-name: --reader-anchor'),
		scrollDrivenAnimations:
			supports('animation-timeline: scroll()') || supports('view-timeline-name: --note'),
		viewTransitions: typeof document !== 'undefined' && 'startViewTransition' in document,
		navigationApi: hasGlobal('navigation'),
		declarativeShadowDom:
			typeof HTMLTemplateElement !== 'undefined' &&
			'shadowRootMode' in HTMLTemplateElement.prototype,
		sanitizerApi: hasGlobal('Sanitizer'),
		editContext: hasGlobal('EditContext'),
		wasm: typeof WebAssembly !== 'undefined',
		wasmSimd: typeof WebAssembly !== 'undefined' && WebAssembly.validate(simdProbe),
		translator: hasGlobal('Translator'),
		languageDetector: hasGlobal('LanguageDetector'),
		summarizer: hasGlobal('Summarizer'),
		languageModel: hasGlobal('LanguageModel'),
		finePointer: !!media?.('(pointer: fine)').matches,
		touch: !!nav && (nav.maxTouchPoints ?? 0) > 0,
		reducedMotion: !!media?.('(prefers-reduced-motion: reduce)').matches,
		storageEstimate: !!storage,
		...detectCssCapabilities(browserCssProbe),
		storageQuota: storage?.quota,
		storageUsage: storage?.usage
	};
}

export function summarizeCapabilities(d: CapabilityDetection): CapabilityStatus[] {
	return [
		{ id: 'webgpu', available: d.webgpu, note: 'GPU compute/graphics experiments' },
		{
			id: 'css-custom-highlight',
			available: d.customHighlight,
			note: 'Range highlights without spans'
		},
		{ id: 'popover-api', available: d.popover, note: 'Native top-layer explanation cards' },
		{ id: 'dialog-commandfor', available: d.dialog, note: 'Native modal baseline' },
		{ id: 'css-anchor-positioning', available: d.anchorPositioning, note: 'CSS-positioned cards' },
		{
			id: 'scroll-driven-animations',
			available: d.scrollDrivenAnimations,
			note: 'CSS scroll/view timelines'
		},
		{ id: 'view-transitions', available: d.viewTransitions, note: 'Mode-change transitions' },
		{ id: 'navigation-api', available: d.navigationApi, note: 'Navigation lifecycle hooks' },
		{ id: 'declarative-shadow-dom', available: d.declarativeShadowDom, note: 'Parse-time islands' },
		{ id: 'html-sanitizer-api', available: d.sanitizerApi, note: 'Native HTML sanitization' },
		{ id: 'editcontext-api', available: d.editContext, note: 'Custom text editor pipeline' },
		{ id: 'wasm', available: d.wasm, note: 'Portable local compute baseline' },
		{ id: 'wasm-simd', available: d.wasmSimd, note: 'Fast local compute path' },
		{ id: 'css-carousels', available: d.cssCarousels, note: 'Native figure/source card decks' },
		{
			id: 'scroll-state-queries',
			available: d.scrollStateQueries,
			note: 'CSS reacts to stuck/snapped reader state'
		},
		{
			id: 'container-queries',
			available: d.containerQueries,
			note: 'Component-local responsive layout'
		},
		{ id: 'style-queries', available: d.styleQueries, note: 'Component variants from CSS state' },
		{ id: 'css-scope', available: d.cssScope, note: 'Scoped publication styling without wrappers' },
		{ id: 'css-nesting', available: d.cssNesting, note: 'Native nested CSS authoring' },
		{
			id: 'has-selector',
			available: d.hasSelector,
			note: 'Parent/state selectors without JS class sync'
		},
		{ id: 'css-subgrid', available: d.subgrid, note: 'Aligned article and marginalia grids' },
		{
			id: 'advanced-typography',
			available: d.advancedTypography,
			note: 'Readable text wrapping, caps, and font metric controls'
		},
		{ id: 'chrome-translator', available: d.translator, note: 'Built-in translation experiments' },
		{
			id: 'chrome-language-detector',
			available: d.languageDetector,
			note: 'Built-in language detection experiments'
		},
		{ id: 'chrome-summarizer', available: d.summarizer, note: 'Built-in summary experiments' },
		{
			id: 'chrome-language-model',
			available: d.languageModel,
			note: 'Built-in prompt API experiments'
		},
		{
			id: 'chrome-built-in-ai',
			available: d.languageModel || d.summarizer || d.translator,
			note: 'Any local Chrome AI API family member'
		},
		{
			id: 'fine-pointer',
			available: d.finePointer,
			note: 'Pointer dwell and rollover affordances'
		},
		{
			id: 'touch-input',
			available: d.touch,
			note: 'Touch reader controls and long-press fallbacks'
		},
		{ id: 'reduced-motion', available: d.reducedMotion, note: 'User requests reduced motion' },
		{ id: 'storage-estimate', available: d.storageEstimate, note: 'Quota-aware local Mask storage' }
	];
}
