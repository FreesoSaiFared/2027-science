import { json } from '@sveltejs/kit';
export function POST() {
	return json({
		revoked: true,
		note: 'No persistent donation storage configured in bootstrap slice.'
	});
}
