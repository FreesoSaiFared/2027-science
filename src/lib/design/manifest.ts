export interface DesignAssetManifestEntry {
	id: string;
	name: string;
	role: string;
	target: string;
}

export interface DesignConstructionManifest {
	title: string;
	slug: string;
	zoneA: {
		mockup: string;
		note: string;
	};
	zoneB: {
		assets: DesignAssetManifestEntry[];
	};
	zoneC: {
		layout: string;
		theme: string;
		interactions: string[];
		cssFeatures: string[];
	};
}

const asString = (value: unknown, fallback = ''): string =>
	typeof value === 'string' ? value : fallback;

const asStringArray = (value: unknown): string[] =>
	Array.isArray(value) ? value.map((item) => asString(item).trim()).filter(Boolean) : [];

function assertObject(value: unknown, name: string): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new Error(`${name} must be an object`);
	}
	return value as Record<string, unknown>;
}

export function safeRouteSlug(input: string): string {
	const slug = input
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 72)
		.replace(/-+$/g, '');
	return slug || 'generated-page';
}

export function escapeSvelteText(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function parseDesignManifest(input: unknown): DesignConstructionManifest {
	const root = assertObject(input, 'manifest');
	const zoneA = assertObject(root.zoneA, 'zoneA');
	const zoneB = assertObject(root.zoneB, 'zoneB');
	const zoneC = assertObject(root.zoneC, 'zoneC');
	const title = asString(root.title).trim();
	if (!title) throw new Error('manifest.title is required');

	const rawAssets = Array.isArray(zoneB.assets) ? zoneB.assets : [];
	const assets = rawAssets.map((asset, index) => {
		const entry = assertObject(asset, `zoneB.assets[${index}]`);
		return {
			id: asString(entry.id, `E${String(index + 1).padStart(3, '0')}`).trim(),
			name: asString(entry.name, 'unnamed_asset').trim(),
			role: asString(entry.role, 'unspecified role').trim(),
			target: asString(entry.target, 'unspecified target').trim()
		};
	});

	return {
		title,
		slug: safeRouteSlug(asString(root.slug, title)),
		zoneA: {
			mockup: asString(zoneA.mockup, '').trim(),
			note: asString(zoneA.note, 'Zone A is a final page mockup; do not slice.').trim()
		},
		zoneB: { assets },
		zoneC: {
			layout: asString(zoneC.layout, 'publication shell').trim(),
			theme: asString(zoneC.theme, '2027.science default').trim(),
			interactions: asStringArray(zoneC.interactions),
			cssFeatures: asStringArray(zoneC.cssFeatures)
		}
	};
}

function listItems(items: string[]): string {
	if (!items.length) return '<li>None specified yet.</li>';
	return items.map((item) => `<li>${escapeSvelteText(item)}</li>`).join('\n\t\t\t\t');
}

export function buildGeneratedRoute(manifest: DesignConstructionManifest): string {
	const title = escapeSvelteText(manifest.title);
	const mockup = escapeSvelteText(manifest.zoneA.mockup || 'not provided');
	const note = escapeSvelteText(manifest.zoneA.note);
	const layout = escapeSvelteText(manifest.zoneC.layout);
	const theme = escapeSvelteText(manifest.zoneC.theme);
	const assets = manifest.zoneB.assets.length
		? manifest.zoneB.assets
				.map(
					(asset) =>
						`<li><strong>${escapeSvelteText(asset.id)}</strong> ${escapeSvelteText(asset.name)} · ${escapeSvelteText(asset.role)} → ${escapeSvelteText(asset.target)}</li>`
				)
				.join('\n\t\t\t\t')
		: '<li>No sprite assets declared.</li>';

	return `<svelte:head><title>${title} · generated design · 2027.science</title></svelte:head>

<main class="generated-design">
	<section class="hero compact">
		<p class="eyebrow">Generated from design-inbox sidecar manifest</p>
		<h1>${title}</h1>
		<p>${note}</p>
	</section>

	<section class="grid">
		<article class="card mockup-card">
			<h2>Zone A · Final mockup</h2>
			<p>Reference image: <code>${mockup}</code></p>
			<p>This bootstrap generator does not slice or OCR the construction sheet.</p>
		</article>
		<article class="card">
			<h2>Zone C · Runtime brief</h2>
			<p><strong>Layout:</strong> ${layout}</p>
			<p><strong>Theme:</strong> ${theme}</p>
		</article>
	</section>

	<section class="grid">
		<article class="card">
			<h2>Zone B · Asset board</h2>
			<ul>
				${assets}
			</ul>
		</article>
		<article class="card">
			<h2>Interactions</h2>
			<ul>
				${listItems(manifest.zoneC.interactions)}
			</ul>
		</article>
		<article class="card">
			<h2>CSS/browser features</h2>
			<ul>
				${listItems(manifest.zoneC.cssFeatures)}
			</ul>
		</article>
	</section>
</main>

<style>
	.compact {
		padding-block: 2rem;
	}
	.generated-design code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}
	.mockup-card {
		background:
			linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, transparent), transparent),
			var(--panel);
	}
</style>
`;
}
