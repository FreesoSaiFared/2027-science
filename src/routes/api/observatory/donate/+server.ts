import { json, type RequestHandler } from '@sveltejs/kit';
import { normalizeQuestProfile, type RedactedQuestProfile } from '$lib/observatory/quest-profile';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => ({}))) as Partial<RedactedQuestProfile>;
	const profile = normalizeQuestProfile(body);
	return json({
		accepted: true,
		stored: false,
		profile,
		expiresAt: profile.expiresAt,
		note: 'Bootstrap skeleton: redacted quest profile accepted for shape validation only; no persistent storage configured yet.'
	});
};
