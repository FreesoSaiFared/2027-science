export type ProviderKind =
	| 'openrouter'
	| 'nvidia-nim'
	| 'cloudflare-workers-ai'
	| 'lmstudio'
	| 'llamacpp'
	| 'ollama'
	| 'mock';

export interface ProviderCandidate {
	id: string;
	kind: ProviderKind;
	label: string;
	baseUrl?: string;
	model?: string;
	configured: boolean;
	local?: boolean;
	freeish?: boolean;
}

export interface ProviderRouteRequest {
	privacy: 'local-first' | 'remote-ok';
	needsJson?: boolean;
	needsChinese?: boolean;
	needsTranslation?: boolean;
}

export interface ProviderScoutScore {
	providerId: string;
	works_now: boolean;
	latency_ms: number | null;
	supports_json: boolean;
	supports_translation: boolean;
	supports_chinese: boolean;
	error_class: string | null;
	checked_at: string;
}
