<svelte:head><title>Night Lab Reader Sheet · generated design · 2027.science</title></svelte:head>

<main class="generated-design">
	<section class="hero compact">
		<p class="eyebrow">Generated from design-inbox sidecar manifest</p>
		<h1>Night Lab Reader Sheet</h1>
		<p>Zone A is the final page mockup and must not be sliced in v1.</p>
	</section>

	<section class="grid">
		<article class="card mockup-card">
			<h2>Zone A · Final mockup</h2>
			<p>Reference image: <code>night-lab-reader.png</code></p>
			<p>This bootstrap generator does not slice or OCR the construction sheet.</p>
		</article>
		<article class="card">
			<h2>Zone C · Runtime brief</h2>
			<p><strong>Layout:</strong> two-column publication with scroll-revealed marginal cards</p>
			<p><strong>Theme:</strong> warm paper, deep ink, spectral blue accents</p>
		</article>
	</section>

	<section class="grid">
		<article class="card">
			<h2>Zone B · Asset board</h2>
			<ul>
				<li><strong>E001</strong> source_orb · citation affordance → reader margin</li>
				<li><strong>E002</strong> diagram_seed · generated diagram placeholder → article figure</li>
			</ul>
		</article>
		<article class="card">
			<h2>Interactions</h2>
			<ul>
				<li>pointer dwell highlight</li>
				<li>popover source cards</li>
				<li>view-transition expansion</li>
			</ul>
		</article>
		<article class="card">
			<h2>CSS/browser features</h2>
			<ul>
				<li>custom-highlight</li>
				<li>popover</li>
				<li>anchor-positioning</li>
				<li>scroll-driven-animations</li>
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
