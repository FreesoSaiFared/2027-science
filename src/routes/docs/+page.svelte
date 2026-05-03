<script lang="ts">
	const docs = [
		'ARCHITECTURE',
		'OPERATIONS',
		'DNS_AND_TUNNEL',
		'WEB_PUBLICATION_RUNTIME',
		'CAPABILITY_DATABASE',
		'CHROME_CANARY_FLAGS',
		'NATIVE_UI_REPLACEMENTS_FOR_MEDIAWIKI',
		'MASK_PRIVACY_MODEL',
		'OBSERVATORY',
		'PROVIDER_SCOUT',
		'CHINESE_DISCOVERY_PIPELINE',
		'DATA_DONATION',
		'COPYRIGHT_AND_SOURCES'
	];
</script>

<main>
	<section class="hero compact">
		<p class="eyebrow">Project documentation</p>
		<h1>Docs</h1>
		<p>
			Canonical operating notes live in the repository under <code>docs/</code>. This index lists
			the local files without pretending a public Git remote exists.
		</p>
	</section>
	<section class="grid">
		{#each docs as doc (doc)}
			<article class="card">
				<h2>{doc}</h2>
				<p><code>docs/{doc}.md</code></p>
			</article>
		{/each}
	</section>
</main>

<style>
	.compact {
		padding-block: 2rem;
	}
	code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}
</style>
