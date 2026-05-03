import { json } from '@sveltejs/kit';
export function GET() {
	return json({ enabled: false, storage: 'not-configured', defaultProcessing: 'client-only' });
}
