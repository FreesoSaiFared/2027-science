export interface MaskConsent {
	observatoryDonation: boolean;
	providerScoutRemoteSmoke: boolean;
	localDiagnostics: boolean;
	updatedAt: string;
}

export interface MaskProfile {
	version: 1;
	id: string;
	displayName: string;
	mode: 'anonymous' | 'paused' | 'local-profile';
	interests: string[];
	languages: string[];
	readerPreferences: {
		density: 'quiet' | 'normal' | 'dense';
		motion: 'system' | 'reduced' | 'expressive';
	};
	consent: MaskConsent;
	createdAt: string;
	updatedAt: string;
}

export function createDefaultMask(now = new Date()): MaskProfile {
	const stamp = now.toISOString();
	const random =
		typeof crypto !== 'undefined' && 'randomUUID' in crypto
			? crypto.randomUUID()
			: `mask-${Date.now()}`;
	return {
		version: 1,
		id: random,
		displayName: 'Anonymous Reader',
		mode: 'anonymous',
		interests: [],
		languages: ['en'],
		readerPreferences: { density: 'normal', motion: 'system' },
		consent: {
			observatoryDonation: false,
			providerScoutRemoteSmoke: false,
			localDiagnostics: true,
			updatedAt: stamp
		},
		createdAt: stamp,
		updatedAt: stamp
	};
}
