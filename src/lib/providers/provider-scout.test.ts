import { describe, expect, test } from 'vitest';
import { defaultProviderRegistry } from './provider-registry';
import { providerEnvPresence, runProviderScout } from './provider-scout';
import { smokeTestProvider } from './provider-smoke-test';
import type { ProviderCandidate } from './types';

describe('Provider Scout skeleton', () => {
	test('registers every required provider family plus mock', () => {
		const ids = defaultProviderRegistry().map((provider) => provider.kind);

		expect(ids).toEqual(
			expect.arrayContaining([
				'openrouter',
				'nvidia-nim',
				'cloudflare-workers-ai',
				'lmstudio',
				'llamacpp',
				'ollama',
				'mock'
			])
		);
	});

	test('maps environment to presence booleans rather than exposing secret values', () => {
		expect(
			providerEnvPresence({
				OPENROUTER_API_KEY: 'placeholder-present-value',
				NVIDIA_NIM_API_KEY: undefined,
				CLOUDFLARE_ACCOUNT_ID: 'account-id'
			})
		).toEqual({
			OPENROUTER_API_KEY: true,
			NVIDIA_NIM_API_KEY: false,
			CLOUDFLARE_API_TOKEN: false,
			CF_API_TOKEN: false,
			CLOUDFLARE_ACCOUNT_ID: true
		});
	});

	test('runs an offline mock smoke test without remote consent', async () => {
		const scores = await runProviderScout({}, false, async () => {
			throw new Error('network should not be required for mock-only assertion');
		});

		expect(scores.some((score) => score.providerId === 'mock' && score.works_now)).toBe(true);
		expect(scores.find((score) => score.providerId === 'openrouter-free')).toBeUndefined();
	});

	test('uses OpenAI-compatible local model endpoints where appropriate', async () => {
		const provider: ProviderCandidate = {
			id: 'lmstudio-local',
			kind: 'lmstudio',
			label: 'LM Studio',
			baseUrl: 'http://localhost:1234/v1',
			configured: true,
			local: true,
			freeish: true
		};
		const requested: string[] = [];
		const result = await smokeTestProvider(provider, async (url) => {
			requested.push(String(url));
			return new Response('{}', { status: 200 });
		});

		expect(requested[0]).toBe('http://localhost:1234/v1/models');
		expect(result.works_now).toBe(true);
	});
});
