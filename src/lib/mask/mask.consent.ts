import type { MaskProfile } from './mask.schema';

export function canDonateObservatoryProfile(mask: MaskProfile): boolean {
	return mask.mode !== 'paused' && mask.consent.observatoryDonation;
}

export function redactMaskForDonation(mask: MaskProfile) {
	return {
		version: mask.version,
		interests: mask.interests.slice(0, 12),
		languages: mask.languages.slice(0, 8),
		readerPreferences: mask.readerPreferences,
		consentUpdatedAt: mask.consent.updatedAt
	};
}
