import type { ProviderCandidate, ProviderRouteRequest } from './types';

export function chooseProvider(
	candidates: ProviderCandidate[],
	request: ProviderRouteRequest
): ProviderCandidate | undefined {
	const configured = candidates.filter((candidate) => candidate.configured);
	if (request.privacy === 'local-first') {
		return (
			configured.find((candidate) => candidate.local && candidate.kind !== 'mock') ??
			configured.find((candidate) => candidate.kind === 'mock')
		);
	}
	return (
		configured.find((candidate) => !candidate.local && candidate.freeish) ??
		configured.find((candidate) => candidate.local && candidate.kind !== 'mock') ??
		configured.find((candidate) => candidate.kind === 'mock')
	);
}
