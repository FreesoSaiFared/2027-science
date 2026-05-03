import { expect, test } from '@playwright/test';

const canonicalRoutes = [
	{ path: '/', heading: '𓇼⚡📜 2027.science' },
	{ path: '/system-check', heading: 'System check' },
	{ path: '/reader-demo', heading: 'Text that keeps its shape' },
	{ path: '/mask', heading: 'Mask' },
	{ path: '/privacy', heading: 'Local first.' },
	{ path: '/observatory', heading: 'Observatory' },
	{ path: '/provider-scout', heading: 'Provider Scout' },
	{ path: '/generated', heading: 'Generated design routes' },
	{ path: '/generated/night-lab-reader', heading: 'Night Lab Reader Sheet' }
];

test('demo scaffold page renders', async ({ page }) => {
	await page.goto('/demo/playwright');
	await expect(page.locator('h1')).toBeVisible();
});

for (const route of canonicalRoutes) {
	test(`canonical route renders: ${route.path}`, async ({ page }) => {
		await page.goto(route.path);
		await expect(page.locator('h1')).toContainText(route.heading);
		await expect(page.locator('main')).toBeVisible();
	});
}

test('primary navigation exposes Canary Codex runtime surfaces', async ({ page }) => {
	await page.goto('/');
	const nav = page.getByRole('navigation', { name: 'Primary' });
	for (const label of [
		'reader demo',
		'system check',
		'mask',
		'privacy',
		'observatory',
		'provider scout',
		'generated',
		'docs'
	]) {
		await expect(nav.getByRole('link', { name: label })).toBeVisible();
	}
});
