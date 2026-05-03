export interface RedactedQuestProfile {
	interests: string[];
	languages: string[];
	constraints?: string[];
	expiresAt: string;
}

export interface DiscoveryShelfItem {
	id: string;
	title: string;
	sourceUrl: string;
	sourceLanguage: string;
	summary: string;
	wow: number;
	englishGap: number;
	rightsMode: 'summary-and-link';
	fullTextStored: false;
	createdAt: string;
}

export function createDonationExpiry(hours = 24, now = new Date()): string {
	return new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
}

function cleanStringArray(value: unknown, limit: number): string[] {
	if (!Array.isArray(value)) return [];
	return value
		.map((item) => (typeof item === 'string' ? item.trim() : ''))
		.filter(Boolean)
		.slice(0, limit);
}

function validIsoOrDefault(value: unknown): string {
	if (typeof value === 'string' && Number.isFinite(Date.parse(value))) return value;
	return createDonationExpiry();
}

function stableShelfId(title: string, sourceUrl: string): string {
	const hash = `${title}:${sourceUrl}`
		.split('')
		.reduce((current, char) => (current * 31 + char.charCodeAt(0)) | 0, 0);
	return `shelf-${Math.abs(hash)}`;
}

export function normalizeQuestProfile(
	input: Partial<RedactedQuestProfile> = {}
): RedactedQuestProfile {
	const languages = cleanStringArray(input.languages, 8);
	return {
		interests: cleanStringArray(input.interests, 12),
		languages: languages.length ? languages : ['en'],
		constraints: cleanStringArray(input.constraints, 8),
		expiresAt: validIsoOrDefault(input.expiresAt)
	};
}

export function createDiscoveryShelfItem(input: {
	title: string;
	sourceUrl: string;
	sourceLanguage: string;
	summary: string;
	wow: number;
	englishGap: number;
	createdAt?: Date;
}): DiscoveryShelfItem {
	const createdAt = input.createdAt ?? new Date();
	return {
		id: stableShelfId(input.title, input.sourceUrl),
		title: input.title,
		sourceUrl: input.sourceUrl,
		sourceLanguage: input.sourceLanguage,
		summary: input.summary,
		wow: input.wow,
		englishGap: input.englishGap,
		rightsMode: 'summary-and-link',
		fullTextStored: false,
		createdAt: createdAt.toISOString()
	};
}
