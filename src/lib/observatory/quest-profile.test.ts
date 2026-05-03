import { describe, expect, test } from 'vitest';
import {
	createDiscoveryShelfItem,
	createDonationExpiry,
	normalizeQuestProfile
} from './quest-profile';

describe('Observatory quest profile safety', () => {
	test('normalizes a redacted profile with bounded interests and an expiry', () => {
		const profile = normalizeQuestProfile({
			interests: [
				' web primitives ',
				'translation',
				'',
				'ai',
				'gpu',
				'css',
				'wasm',
				'canary',
				'extra'
			],
			languages: ['en', 'zh-Hans', '', 'fr', 'de', 'ja', 'ko', 'es', 'extra'],
			constraints: ['no full article clones', '', 'source links required']
		});

		expect(profile.interests).toEqual([
			'web primitives',
			'translation',
			'ai',
			'gpu',
			'css',
			'wasm',
			'canary',
			'extra'
		]);
		expect(profile.languages).toEqual(['en', 'zh-Hans', 'fr', 'de', 'ja', 'ko', 'es', 'extra']);
		expect(profile.constraints).toEqual(['no full article clones', 'source links required']);
		expect(Date.parse(profile.expiresAt)).toBeGreaterThan(Date.now());
	});

	test('creates original result shelf items instead of cloned articles', () => {
		const item = createDiscoveryShelfItem({
			title: 'New Chinese robotics note',
			sourceUrl: 'https://example.cn/note',
			sourceLanguage: 'zh',
			summary: 'A short original English discovery card.',
			wow: 0.84,
			englishGap: 0.9
		});

		expect(item.rightsMode).toBe('summary-and-link');
		expect(item.fullTextStored).toBe(false);
		expect(item.sourceUrl).toBe('https://example.cn/note');
	});

	test('creates ISO donation expiries', () => {
		expect(createDonationExpiry(1)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
	});
});
