import { describe, expect, test } from 'vitest';
import { computeBrowserTier, detectCssCapabilities, type CssCapabilityProbe } from './detect';

const base = {
	webgpu: false,
	customHighlight: false,
	popover: false,
	dialog: true,
	anchorPositioning: false,
	scrollDrivenAnimations: false,
	viewTransitions: false,
	navigationApi: false,
	declarativeShadowDom: false,
	sanitizerApi: false,
	editContext: false,
	wasm: true,
	wasmSimd: false,
	translator: false,
	languageDetector: false,
	summarizer: false,
	languageModel: false,
	finePointer: false,
	touch: false,
	reducedMotion: false,
	storageEstimate: false,
	cssCarousels: false,
	scrollStateQueries: false,
	containerQueries: false,
	styleQueries: false,
	cssScope: false,
	cssNesting: false,
	hasSelector: false,
	subgrid: false,
	advancedTypography: false
};

describe('computeBrowserTier', () => {
	test('keeps a readable baseline as reader-basic', () => {
		expect(computeBrowserTier(base)).toBe('reader-basic');
	});

	test('promotes native overlays when highlight and popover are available', () => {
		expect(computeBrowserTier({ ...base, customHighlight: true, popover: true })).toBe(
			'reader-native-overlays'
		);
	});

	test('promotes Canary text lab before GPU AI', () => {
		expect(
			computeBrowserTier({
				...base,
				customHighlight: true,
				popover: true,
				anchorPositioning: true,
				scrollDrivenAnimations: true,
				viewTransitions: true,
				editContext: true
			})
		).toBe('reader-canary-text-lab');
	});

	test('requires GPU plus built-in model family for reader-gpu-ai', () => {
		expect(
			computeBrowserTier({
				...base,
				webgpu: true,
				customHighlight: true,
				popover: true,
				anchorPositioning: true,
				scrollDrivenAnimations: true,
				viewTransitions: true,
				languageModel: true
			})
		).toBe('reader-gpu-ai');
	});
	test('promotes author lab when GPU, built-in AI, and text-lab primitives align', () => {
		expect(
			computeBrowserTier({
				...base,
				webgpu: true,
				customHighlight: true,
				popover: true,
				anchorPositioning: true,
				scrollDrivenAnimations: true,
				viewTransitions: true,
				editContext: true,
				languageModel: true
			})
		).toBe('author-lab');
	});

	test('detects style queries by parsing an @container style rule', () => {
		const seenRules: string[] = [];
		const probe: CssCapabilityProbe = {
			supports: (query) =>
				['scroll-snap-type: x mandatory', 'container-type: inline-size'].includes(query),
			supportsSelector: (selector) => selector === ':has(*)',
			supportsRule: (rule) => {
				seenRules.push(rule);
				return rule.startsWith('@container style(');
			}
		};

		const css = detectCssCapabilities(probe);

		expect(css.styleQueries).toBe(true);
		expect(seenRules).toContain(
			'@container style(--reader-mode: dense) { .reader { color: red; } }'
		);
		expect(css.containerQueries).toBe(true);
		expect(css.hasSelector).toBe(true);
	});

	test('summarizes the broader modern CSS and platform checklist', async () => {
		const { summarizeCapabilities } = await import('./detect');
		const ids = summarizeCapabilities({
			...base,
			cssCarousels: true,
			scrollStateQueries: true,
			containerQueries: true,
			styleQueries: true,
			cssScope: true,
			cssNesting: true,
			hasSelector: true,
			subgrid: true,
			advancedTypography: true
		}).map((status) => status.id);

		expect(ids).toEqual(
			expect.arrayContaining([
				'css-carousels',
				'scroll-state-queries',
				'container-queries',
				'style-queries',
				'css-scope',
				'css-nesting',
				'has-selector',
				'css-subgrid',
				'advanced-typography'
			])
		);
	});
});
