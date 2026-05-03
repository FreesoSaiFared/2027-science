<script lang="ts">
	import { defaultProviderRegistry } from '$lib/providers/provider-registry';
	import { chooseProvider } from '$lib/providers/provider-routing-policy';

	const providers = defaultProviderRegistry();
	const localFirstPick = chooseProvider(providers, { privacy: 'local-first' });
	const remoteOkPick = chooseProvider(providers, { privacy: 'remote-ok' });
</script>

<svelte:head><title>Provider Scout · 2027.science</title></svelte:head>

<main>
	<section class="hero compact">
		<p class="eyebrow">No keys in the browser</p>
		<h1>Provider Scout</h1>
		<p>
			Provider Scout compares free/free-ish hosted endpoints and local model servers through a small
			server-side routing contract. This page publishes the architecture only; remote smoke tests
			need explicit Mask consent and secrets stay outside client bundles.
		</p>
	</section>

	<section class="grid">
		<article class="card">
			<h2>Routing examples</h2>
			<p><strong>Local-first:</strong> {localFirstPick?.label ?? 'mock only'}</p>
			<p><strong>Remote allowed:</strong> {remoteOkPick?.label ?? 'mock only'}</p>
		</article>
		<article class="card">
			<h2>Smoke-test policy</h2>
			<ul>
				<li>Mock provider always works offline for tests.</li>
				<li>Local providers probe localhost model-list endpoints.</li>
				<li>
					Hosted providers return <code>remote_smoke_requires_explicit_consent</code> until consent and
					server-side credentials exist.
				</li>
			</ul>
		</article>
	</section>

	<section>
		<h2>Candidate registry</h2>
		<div class="grid">
			{#each providers as provider (provider.id)}
				<article class="card provider-card">
					<span class="pill">{provider.local ? 'local/mock' : 'hosted'}</span>
					<h3>{provider.label}</h3>
					<dl>
						<div>
							<dt>Kind</dt>
							<dd>{provider.kind}</dd>
						</div>
						<div>
							<dt>Configured</dt>
							<dd>{provider.configured ? 'present' : 'missing'}</dd>
						</div>
						{#if provider.baseUrl}<div>
								<dt>Endpoint</dt>
								<dd><code>{provider.baseUrl}</code></dd>
							</div>{/if}
					</dl>
				</article>
			{/each}
		</div>
	</section>
</main>

<style>
	.compact {
		padding-block: 2rem;
	}
	.provider-card dl {
		display: grid;
		gap: 0.4rem;
	}
	.provider-card div {
		display: grid;
		grid-template-columns: 7rem 1fr;
		gap: 0.5rem;
	}
	dt {
		color: var(--muted);
	}
	dd {
		margin: 0;
	}
	code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}
</style>
