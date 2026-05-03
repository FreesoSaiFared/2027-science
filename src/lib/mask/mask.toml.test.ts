import { describe, expect, test } from 'vitest';
import { createDefaultMask } from './mask.schema';
import { exportMaskToml, importMaskToml } from './mask.toml';

describe('Mask TOML-ish export/import', () => {
	test('round-trips a local anonymous profile without server identity', () => {
		const mask = createDefaultMask();
		mask.displayName = 'Anonymous Scholar';
		mask.interests = ['web primitives', 'translation'];
		mask.consent.observatoryDonation = false;

		const text = exportMaskToml(mask);
		expect(text).toContain('displayName = "Anonymous Scholar"');
		expect(text).not.toContain('token');

		const parsed = importMaskToml(text);
		expect(parsed.displayName).toBe('Anonymous Scholar');
		expect(parsed.interests).toEqual(['web primitives', 'translation']);
		expect(parsed.consent.observatoryDonation).toBe(false);
	});
});
