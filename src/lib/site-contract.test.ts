import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

const projectTitle = '𓇼⚡📜 2027.science · The Canary Codex 🔭🧪';
const canonRoutes = [
	'/',
	'/system-check',
	'/reader-demo',
	'/mask',
	'/privacy',
	'/observatory',
	'/generated',
	'/provider-scout'
];
const designPipelineDirs = [
	'design-inbox',
	'design-processed',
	'design-rejected',
	'static/generated'
];

function routePagePath(route: string) {
	return route === '/' ? 'src/routes/+page.svelte' : `src/routes${route}/+page.svelte`;
}

describe('2027.science site contract', () => {
	test('materializes every canon page route', () => {
		expect(canonRoutes.map((route) => [route, existsSync(routePagePath(route))])).toEqual(
			canonRoutes.map((route) => [route, true])
		);
	});

	test('exposes every canon page in the primary navigation', () => {
		const layout = readFileSync('src/routes/+layout.svelte', 'utf8');

		expect(canonRoutes.map((route) => [route, layout.includes(`resolve('${route}')`)])).toEqual(
			canonRoutes.map((route) => [route, true])
		);
	});

	test('uses the canonical project title on the home page', () => {
		const home = readFileSync('src/routes/+page.svelte', 'utf8');

		expect(home).toContain(projectTitle);
	});

	test('keeps the sidecar-first design pipeline directories available', () => {
		expect(designPipelineDirs.map((dir) => [dir, existsSync(dir)])).toEqual(
			designPipelineDirs.map((dir) => [dir, true])
		);
	});

	test('documents the route architecture and non-mutating ops check', () => {
		const architecture = readFileSync('docs/ARCHITECTURE.md', 'utf8');
		const operations = readFileSync('docs/OPERATIONS.md', 'utf8');

		expect(architecture).toContain('SvelteKit');
		expect(architecture).toContain('@sveltejs/adapter-cloudflare');
		expect(architecture).toContain('/system-check');
		expect(architecture).toContain('/reader-demo');
		expect(architecture).toContain('/generated');
		expect(architecture).toContain('/provider-scout');
		expect(operations).toContain('npm run ops:check');
		expect(operations).toContain('non-mutating');
	});
});
