import type { ProviderCandidate } from './types';

export interface ProviderEnvPresence {
	OPENROUTER_API_KEY?: boolean;
	NVIDIA_NIM_API_KEY?: boolean;
	CLOUDFLARE_API_TOKEN?: boolean;
	CF_API_TOKEN?: boolean;
	CLOUDFLARE_ACCOUNT_ID?: boolean;
}

export function defaultProviderRegistry(env: ProviderEnvPresence = {}): ProviderCandidate[] {
	return [
		{
			id: 'openrouter-free',
			kind: 'openrouter',
			label: 'OpenRouter free/free-ish candidates',
			baseUrl: 'https://openrouter.ai/api/v1',
			model: 'free-model-candidate',
			configured: !!env.OPENROUTER_API_KEY,
			freeish: true
		},
		{
			id: 'nvidia-nim',
			kind: 'nvidia-nim',
			label: 'NVIDIA NIM OpenAI-compatible',
			baseUrl: 'https://integrate.api.nvidia.com/v1',
			configured: !!env.NVIDIA_NIM_API_KEY,
			freeish: true
		},
		{
			id: 'cloudflare-workers-ai',
			kind: 'cloudflare-workers-ai',
			label: 'Cloudflare Workers AI',
			configured: !!(env.CLOUDFLARE_API_TOKEN || env.CF_API_TOKEN || env.CLOUDFLARE_ACCOUNT_ID),
			freeish: true
		},
		{
			id: 'lmstudio-local',
			kind: 'lmstudio',
			label: 'LM Studio local server',
			baseUrl: 'http://localhost:1234/v1',
			configured: true,
			local: true,
			freeish: true
		},
		{
			id: 'llamacpp-local',
			kind: 'llamacpp',
			label: 'llama.cpp local server',
			baseUrl: 'http://localhost:8080/v1',
			configured: true,
			local: true,
			freeish: true
		},
		{
			id: 'ollama-local',
			kind: 'ollama',
			label: 'Ollama local server',
			baseUrl: 'http://localhost:11434',
			configured: true,
			local: true,
			freeish: true
		},
		{
			id: 'mock',
			kind: 'mock',
			label: 'Mock provider for tests',
			configured: true,
			local: true,
			freeish: true
		}
	];
}
