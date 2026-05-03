import { describe, expect, test } from 'vitest';
import { buildGeneratedRoute, parseDesignManifest, safeRouteSlug } from './manifest';

describe('design manifest ingestion', () => {
	test('sanitizes a manifest title into a bounded route slug', () => {
		expect(safeRouteSlug('../Night Lab: EPUB++ Construction Sheet!!')).toBe(
			'night-lab-epub-construction-sheet'
		);
	});

	test('parses the sidecar manifest without trusting image OCR', () => {
		const manifest = parseDesignManifest({
			title: 'Night Lab',
			slug: 'night-lab',
			zoneA: { mockup: 'night-lab.png', note: 'Final page mockup; do not slice.' },
			zoneB: {
				assets: [
					{ id: 'E001', name: 'source_orb', role: 'citation affordance', target: 'reader margin' }
				]
			},
			zoneC: {
				layout: 'two-column publication with marginal cards',
				theme: 'ink on warm paper with blue spectral accents',
				interactions: ['popover source cards', 'scroll-revealed marginalia'],
				cssFeatures: ['popover', 'anchor-positioning', 'scroll-driven-animations']
			}
		});

		expect(manifest.slug).toBe('night-lab');
		expect(manifest.zoneB.assets[0].id).toBe('E001');
		expect(manifest.zoneC.cssFeatures).toContain('popover');
	});

	test('generates a safe Svelte route preview from the manifest', () => {
		const route = buildGeneratedRoute(
			parseDesignManifest({
				title: 'Prototype <script>alert(1)</script>',
				slug: 'prototype',
				zoneA: { mockup: 'prototype.png', note: 'Final page mockup; do not slice.' },
				zoneB: { assets: [] },
				zoneC: {
					layout: 'single-column reader shell',
					theme: 'dark lab',
					interactions: ['dwell highlight'],
					cssFeatures: ['custom-highlight']
				}
			})
		);

		expect(route).toContain('Prototype &lt;script&gt;alert(1)&lt;/script&gt;');
		expect(route).not.toContain('<script>alert(1)</script>');
		expect(route).toContain('single-column reader shell');
	});
});
