<main>
	<section class="hero compact">
		<p class="eyebrow">Optional discovery system</p>
		<h1>Observatory</h1>
		<p>
			The Observatory is a privacy-first skeleton for finding useful under-translated sources,
			especially Chinese-language material, and producing original English discovery cards with
			source links.
		</p>
	</section>
	<section class="grid">
		<article class="card">
			<h2>Consent</h2>
			<p>No server processing by default. Donation sends only a redacted quest profile.</p>
			<ul>
				<li>Explicit donation only.</li>
				<li>Expiry attached to every quest profile.</li>
				<li>Revoke endpoint exists before persistent storage is added.</li>
			</ul>
		</article>
		<article class="card">
			<h2>Sources</h2>
			<p>
				Respect robots.txt, source terms, copyright, and avoid publishing full translations by
				default.
			</p>
			<ul>
				<li>Source quality score: author, citations, primary-source signal.</li>
				<li>English-gap score: prioritizes under-translated material.</li>
				<li>WOW score: novelty, usefulness, source quality, gap.</li>
			</ul>
		</article>
		<article class="card">
			<h2>Output</h2>
			<p>Original summaries, commentary, gap scores, and links—not scraped article mirrors.</p>
			<ul>
				<li><code>rightsMode: summary-and-link</code></li>
				<li><code>fullTextStored: false</code></li>
				<li>Result shelf remains empty until an operator enables processing.</li>
			</ul>
		</article>
	</section>

	<section class="card lifecycle">
		<h2>Bootstrap API lifecycle</h2>
		<ol>
			<li><code>GET /api/observatory/status</code> reports no storage and client-only defaults.</li>
			<li><code>POST /api/observatory/donate</code> normalizes a redacted quest profile shape.</li>
			<li><code>GET /api/observatory/results</code> returns an empty shelf by default.</li>
			<li><code>POST /api/observatory/revoke</code> is safe before storage exists.</li>
		</ol>
	</section>
</main>

<style>
	.compact {
		padding-block: 2rem;
	}
	.lifecycle {
		margin-block-start: 1rem;
	}
	code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}
</style>
