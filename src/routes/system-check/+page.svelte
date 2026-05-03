<script lang="ts">
	import { onMount } from 'svelte';
	import { capabilitySeed } from '$lib/capabilities/seed';
	import {
		computeBrowserTier,
		detectCapabilities,
		summarizeCapabilities
	} from '$lib/capabilities/detect';
	import type { CapabilityDetection, CapabilityStatus } from '$lib/capabilities/types';

	let detection = $state<CapabilityDetection | null>(null);
	let statuses = $state<CapabilityStatus[]>([]);
	let tier = $derived(detection ? computeBrowserTier(detection) : 'reader-basic');
	let availableCount = $derived(statuses.filter((status) => status.available).length);
	let fallbackCount = $derived(statuses.length - availableCount);
	const tiers = [
		{ id: 'reader-basic', label: 'Readable semantic baseline' },
		{ id: 'reader-native-overlays', label: 'Custom Highlight + Popover overlays' },
		{ id: 'reader-native-animations', label: 'CSS scroll animation + View Transitions' },
		{ id: 'reader-canary-text-lab', label: 'Anchor Positioning + EditContext authoring' },
		{ id: 'reader-gpu-ai', label: 'WebGPU plus local AI family' },
		{ id: 'author-lab', label: 'GPU/AI and Canary text lab combined' }
	];

	onMount(async () => {
		detection = await detectCapabilities();
		statuses = summarizeCapabilities(detection);
	});
</script>

<main>
	<section class="hero compact">
		<p class="eyebrow">Browser capability probe</p>
		<h1>System check</h1>
		<p>Detected tier: <strong>{tier}</strong></p>
		{#if detection}
			<p class="capability-count">
				{availableCount} available · {fallbackCount} fallback paths active
			</p>
		{/if}
	</section>
	<section class="tier-strip" aria-label="Reader tier ladder">
		{#each tiers as item (item.id)}
			<article class:current={item.id === tier} class="tier-card">
				<span class="pill">{item.id === tier ? 'current' : 'tier'}</span>
				<h2>{item.id}</h2>
				<p>{item.label}</p>
			</article>
		{/each}
	</section>
	{#if detection}
		<section class="grid">
			{#each statuses as status (status.id)}
				<article class:available={status.available} class="card status-card">
					<span class="pill">{status.available ? 'available' : 'fallback'}</span>
					<h2>{status.id}</h2>
					<p>{status.note}</p>
				</article>
			{/each}
		</section>
		<section class="card raw">
			<h2>Local signals</h2>
			<pre>{JSON.stringify(detection, null, 2)}</pre>
		</section>
	{:else}
		<p>Running browser-only checks…</p>
	{/if}
	<section>
		<h2>Capability database</h2>
		<div class="cap-list">
			{#each capabilitySeed as cap (cap.id)}
				<article class="card">
					<h3>{cap.feature}</h3>
					<p><strong>{cap.browserPrimitive}</strong></p>
					<p>{cap.readerUseCase}</p>
					<p><span class="pill">{cap.status}</span></p>
				</article>
			{/each}
		</div>
	</section>
</main>

<style>
	.compact {
		padding-block: 2rem;
	}
	.capability-count {
		color: var(--muted);
	}
	.tier-strip {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
		gap: 0.75rem;
		margin-block-end: 1rem;
	}
	.tier-card {
		border: 1px solid var(--line);
		border-radius: 1rem;
		padding: 0.8rem;
		background: color-mix(in srgb, white 68%, transparent);
	}
	.tier-card h2 {
		font-size: 1rem;
		letter-spacing: -0.02em;
	}
	.tier-card.current,
	.status-card.available {
		outline: 2px solid color-mix(in srgb, var(--accent) 45%, transparent);
	}
	.raw {
		margin-block: 1rem;
	}
	pre {
		overflow: auto;
	}
	.cap-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 0.75rem;
	}
</style>
