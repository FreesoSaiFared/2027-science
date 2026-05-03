import { describe, expect, test } from 'vitest';
import { capabilitySeed } from './seed';

describe('web platform capability seed', () => {
	test('links every capability to primary documentation', () => {
		const docs = capabilitySeed.map(({ docsUrl, id }) => ({ docsUrl, id }));

		expect(docs).toHaveLength(18);
		expect(docs).toEqual(
			docs.map(({ id }) => ({
				id,
				docsUrl: expect.stringMatching(
					/^https:\/\/(developer\.mozilla\.org|developer\.chrome\.com)\//
				)
			}))
		);
		expect(docs.filter(({ docsUrl }) => docsUrl.includes('TODO'))).toEqual([]);
	});
});
