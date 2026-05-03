import { describe, expect, test } from 'vitest';
import { chooseProvider } from './provider-routing-policy';
import type { ProviderCandidate } from './types';

const candidates: ProviderCandidate[] = [
	{
		id: 'ollama-local',
		kind: 'ollama',
		label: 'Ollama',
		local: true,
		configured: true,
		freeish: true
	},
	{
		id: 'openrouter-free',
		kind: 'openrouter',
		label: 'OpenRouter Free',
		configured: true,
		freeish: true
	},
	{ id: 'mock', kind: 'mock', label: 'Mock', configured: true, freeish: true }
];

describe('chooseProvider', () => {
	test('prefers local providers for private tasks', () => {
		expect(chooseProvider(candidates, { privacy: 'local-first' })?.id).toBe('ollama-local');
	});

	test('uses free hosted providers when remote is allowed', () => {
		expect(chooseProvider(candidates, { privacy: 'remote-ok' })?.id).toBe('openrouter-free');
	});

	test('falls back to mock provider when nothing else is configured', () => {
		expect(chooseProvider([candidates[2]], { privacy: 'remote-ok' })?.id).toBe('mock');
	});
});
