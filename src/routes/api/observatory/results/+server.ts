import { json } from '@sveltejs/kit';
export function GET() {
	return json({
		results: [],
		note: 'No server-side Observatory processing is enabled by default.'
	});
}
