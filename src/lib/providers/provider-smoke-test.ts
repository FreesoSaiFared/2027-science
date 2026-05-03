import type { ProviderCandidate, ProviderScoutScore } from './types';

function localSmokeEndpoint(provider: ProviderCandidate): string {
	const baseUrl = provider.baseUrl ?? '';
	const suffix = provider.kind === 'ollama' ? '/api/tags' : '/models';
	return `${baseUrl.replace(/\/$/, '')}${suffix}`;
}

export async function smokeTestProvider(
	provider: ProviderCandidate,
	fetcher: typeof fetch = fetch
): Promise<ProviderScoutScore> {
	const checked_at = new Date().toISOString();
	if (provider.kind === 'mock') {
		return {
			providerId: provider.id,
			works_now: true,
			latency_ms: 0,
			supports_json: true,
			supports_translation: false,
			supports_chinese: true,
			error_class: null,
			checked_at
		};
	}
	if (!provider.configured) {
		return {
			providerId: provider.id,
			works_now: false,
			latency_ms: null,
			supports_json: false,
			supports_translation: false,
			supports_chinese: false,
			error_class: 'not_configured',
			checked_at
		};
	}
	if (provider.local) {
		const start = Date.now();
		try {
			const response = await fetcher(localSmokeEndpoint(provider), {
				signal: AbortSignal.timeout(1500)
			});
			return {
				providerId: provider.id,
				works_now: response.ok,
				latency_ms: Date.now() - start,
				supports_json: provider.kind !== 'ollama',
				supports_translation: false,
				supports_chinese: false,
				error_class: response.ok ? null : `http_${response.status}`,
				checked_at
			};
		} catch (error) {
			return {
				providerId: provider.id,
				works_now: false,
				latency_ms: Date.now() - start,
				supports_json: false,
				supports_translation: false,
				supports_chinese: false,
				error_class: error instanceof Error ? error.name : 'unknown_error',
				checked_at
			};
		}
	}
	return {
		providerId: provider.id,
		works_now: false,
		latency_ms: null,
		supports_json: true,
		supports_translation: true,
		supports_chinese: true,
		error_class: 'remote_smoke_requires_explicit_consent',
		checked_at
	};
}
