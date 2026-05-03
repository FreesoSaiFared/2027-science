import { createDefaultMask, type MaskProfile } from './mask.schema';

const quote = (value: string) => JSON.stringify(value);
const array = (values: string[]) => `[${values.map(quote).join(', ')}]`;
const bool = (value: boolean) => (value ? 'true' : 'false');

export function exportMaskToml(mask: MaskProfile): string {
	return `# 2027.science local Mask profile. Do not paste secrets here.\nversion = ${mask.version}\nid = ${quote(mask.id)}\ndisplayName = ${quote(mask.displayName)}\nmode = ${quote(mask.mode)}\ninterests = ${array(mask.interests)}\nlanguages = ${array(mask.languages)}\ncreatedAt = ${quote(mask.createdAt)}\nupdatedAt = ${quote(mask.updatedAt)}\n\n[readerPreferences]\ndensity = ${quote(mask.readerPreferences.density)}\nmotion = ${quote(mask.readerPreferences.motion)}\n\n[consent]\nobservatoryDonation = ${bool(mask.consent.observatoryDonation)}\nproviderScoutRemoteSmoke = ${bool(mask.consent.providerScoutRemoteSmoke)}\nlocalDiagnostics = ${bool(mask.consent.localDiagnostics)}\nupdatedAt = ${quote(mask.consent.updatedAt)}\n`;
}

function parseValue(value: string): string | boolean | string[] | number {
	const trimmed = value.trim();
	if (trimmed === 'true') return true;
	if (trimmed === 'false') return false;
	if (/^\d+$/.test(trimmed)) return Number(trimmed);
	if (trimmed.startsWith('[')) return JSON.parse(trimmed) as string[];
	return JSON.parse(trimmed) as string;
}

export function importMaskToml(text: string): MaskProfile {
	const mask = createDefaultMask();
	let section: 'root' | 'readerPreferences' | 'consent' = 'root';
	for (const raw of text.split(/\r?\n/)) {
		const line = raw.trim();
		if (!line || line.startsWith('#')) continue;
		if (line === '[readerPreferences]') {
			section = 'readerPreferences';
			continue;
		}
		if (line === '[consent]') {
			section = 'consent';
			continue;
		}
		const index = line.indexOf('=');
		if (index < 1) continue;
		const key = line.slice(0, index).trim();
		const value = parseValue(line.slice(index + 1));
		if (section === 'root') {
			if (key === 'version') mask.version = 1;
			if (key === 'id' && typeof value === 'string') mask.id = value;
			if (key === 'displayName' && typeof value === 'string') mask.displayName = value;
			if (
				key === 'mode' &&
				(value === 'anonymous' || value === 'paused' || value === 'local-profile')
			)
				mask.mode = value;
			if (key === 'interests' && Array.isArray(value)) mask.interests = value;
			if (key === 'languages' && Array.isArray(value)) mask.languages = value;
			if (key === 'createdAt' && typeof value === 'string') mask.createdAt = value;
			if (key === 'updatedAt' && typeof value === 'string') mask.updatedAt = value;
		} else if (section === 'readerPreferences') {
			if (key === 'density' && (value === 'quiet' || value === 'normal' || value === 'dense'))
				mask.readerPreferences.density = value;
			if (key === 'motion' && (value === 'system' || value === 'reduced' || value === 'expressive'))
				mask.readerPreferences.motion = value;
		} else {
			if (key === 'observatoryDonation' && typeof value === 'boolean')
				mask.consent.observatoryDonation = value;
			if (key === 'providerScoutRemoteSmoke' && typeof value === 'boolean')
				mask.consent.providerScoutRemoteSmoke = value;
			if (key === 'localDiagnostics' && typeof value === 'boolean')
				mask.consent.localDiagnostics = value;
			if (key === 'updatedAt' && typeof value === 'string') mask.consent.updatedAt = value;
		}
	}
	return mask;
}
