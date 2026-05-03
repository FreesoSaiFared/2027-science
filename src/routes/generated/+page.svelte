<script lang="ts">
	import { resolve } from '$app/paths';

	const generatedPages = [
		{
			title: 'Night Lab Reader Sheet',
			slug: 'night-lab-reader',
			source: 'design-inbox/example.manifest.json',
			note: 'Sidecar-first route generated from the sample construction manifest.',
			href: resolve('/generated/night-lab-reader')
		}
	];
	const pipelineDirs = [
		'design-inbox/',
		'design-processed/',
		'design-rejected/',
		'static/generated/'
	];
</script>

<svelte:head><title>Generated designs · 2027.science</title></svelte:head>

<main>
	<section class="hero compact">
		<p class="eyebrow">Image-to-site pipeline</p>
		<h1>Generated design routes</h1>
		<p>
			Design ingestion starts with a human-readable sidecar manifest. The generator creates a
			reviewable Svelte route; it does not OCR, slice images, call AI services, deploy, or mutate
			DNS.
		</p>
	</section>

	<section class="grid">
		{#each generatedPages as page (page.slug)}
			<article class="card generated-card">
				<span class="pill">generated</span>
				<h2>{page.title}</h2>
				<p>{page.note}</p>
				<p><strong>Manifest:</strong> <code>{page.source}</code></p>
				<a class="button" href={page.href}>Open route</a>
			</article>
		{/each}
	</section>

	<section class="card pipeline">
		<h2>Pipeline contract</h2>
		<ul>
			{#each pipelineDirs as dir (dir)}
				<li><code>{dir}</code></li>
			{/each}
		</ul>
		<p>
			Run <code>npm run design:ingest -- design-inbox/example.manifest.json</code> to regenerate the sample
			route from its sidecar manifest.
		</p>
	</section>
</main>

<style>
	.compact {
		padding-block: 2rem;
	}
	.generated-card code,
	.pipeline code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}
</style>
