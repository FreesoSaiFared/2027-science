import { defaultProviderRegistry, type ProviderEnvPresence } from './provider-registry';
import { smokeTestProvider } from './provider-smoke-test';
import type { ProviderScoutScore } from './types';

export function providerEnvPresence(env: Record<string, string | undefined>): ProviderEnvPresence {
	return {
		OPENROUTER_API_KEY: !!env.OPENROUTER_API_KEY,
		NVIDIA_NIM_API_KEY: !!env.NVIDIA_NIM_API_KEY,
		CLOUDFLARE_API_TOKEN: !!env.CLOUDFLARE_API_TOKEN,
		CF_API_TOKEN: !!env.CF_API_TOKEN,
		CLOUDFLARE_ACCOUNT_ID: !!env.CLOUDFLARE_ACCOUNT_ID
	};
}

export async function runProviderScout(
	env: ProviderEnvPresence,
	remoteConsent = false,
	fetcher: typeof fetch = fetch
): Promise<ProviderScoutScore[]> {
	const candidates = defaultProviderRegistry(env).filter(
		(candidate) => remoteConsent || candidate.local || candidate.kind === 'mock'
	);
	return Promise.all(candidates.map((candidate) => smokeTestProvider(candidate, fetcher)));
}
