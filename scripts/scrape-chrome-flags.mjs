#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'data/chrome-canary-flags.local.json';
const categories = [
	'rendering/compositing',
	'CSS/layout',
	'animation/scroll',
	'text/highlighting/editing',
	'graphics/WebGPU/WebGL',
	'media/audio/video',
	'AI/built-in model',
	'privacy/security/storage',
	'PWA/navigation/routing',
	'accessibility/input',
	'devtools/productivity',
	'browser UI/internal'
];
function categorize(text) {
	const t = text.toLowerCase();
	if (/webgpu|webgl|gpu|canvas/.test(t)) return 'graphics/WebGPU/WebGL';
	if (/css|layout|anchor|container|scope|nesting/.test(t)) return 'CSS/layout';
	if (/scroll|animation|transition/.test(t)) return 'animation/scroll';
	if (/highlight|edit|text|translation|language|summar|prompt|ai|model/.test(t))
		return /ai|model|prompt|summar|translator|language/.test(t)
			? 'AI/built-in model'
			: 'text/highlighting/editing';
	if (/privacy|security|storage|cookie/.test(t)) return 'privacy/security/storage';
	if (/pwa|navigation|route|back-forward/.test(t)) return 'PWA/navigation/routing';
	if (/accessibility|input|pointer|touch/.test(t)) return 'accessibility/input';
	if (/devtools/.test(t)) return 'devtools/productivity';
	if (/media|audio|video/.test(t)) return 'media/audio/video';
	if (/render|composit/.test(t)) return 'rendering/compositing';
	return 'browser UI/internal';
}
const fallback = {
	generatedAt: new Date().toISOString(),
	available: false,
	categories,
	flags: [],
	error: ''
};
try {
	const browser = await chromium.launch({ channel: 'chrome-canary', headless: false });
	const page = await browser.newPage();
	await page.goto('chrome://flags', { waitUntil: 'domcontentloaded', timeout: 10000 });
	const flags = await page.evaluate(() => {
		const rows = [...document.querySelectorAll('flags-app')].flatMap((app) => [
			...(app.shadowRoot?.querySelectorAll('flags-experiment') ?? [])
		]);
		return rows.map((row) => {
			const root = row.shadowRoot;
			const title = root?.querySelector('.experiment-name')?.textContent?.trim() ?? '';
			const description = root?.querySelector('.description')?.textContent?.trim() ?? '';
			const id = root?.querySelector('.permalink')?.textContent?.trim().replace(/^#/, '') ?? '';
			const state =
				root?.querySelector('select')?.selectedOptions?.[0]?.textContent?.trim() ?? 'unknown';
			return { title, id, description, state };
		});
	});
	await browser.close();
	const enriched = flags
		.filter((flag) => flag.title || flag.id)
		.map((flag) => ({
			...flag,
			category: categorize(`${flag.title} ${flag.description} ${flag.id}`),
			relevance2027: 'review for author-lab only; never required for baseline reading',
			associatedWebFeature: '',
			exampleUse: '',
			dangerRisk: 'Experimental flags may reduce stability or privacy.',
			recommendedStateForAuthorLabProfile: 'manual-review'
		}));
	await mkdir('data', { recursive: true });
	await writeFile(
		output,
		JSON.stringify(
			{ generatedAt: new Date().toISOString(), available: true, categories, flags: enriched },
			null,
			'\t'
		) + '\n'
	);
	console.log(`wrote ${output} (${enriched.length} flags)`);
} catch (error) {
	fallback.error = error instanceof Error ? error.message : String(error);
	await mkdir('data', { recursive: true });
	await writeFile(output, JSON.stringify(fallback, null, '\t') + '\n');
	console.log(`Chrome Canary flag scrape unavailable; wrote fallback ${output}`);
}
