<script lang="ts">
	import { resolve } from '$app/paths';

	const projectTitle = '𓇼⚡📜 2027.science · The Canary Codex 🔭🧪';
</script>

<svelte:head>
	<title>{projectTitle}</title>
	<meta
		name="description"
		content="A SvelteKit and Cloudflare-native living publication runtime for 2027.science."
	/>
</svelte:head>

<main>
	<section class="hero">
		<p class="eyebrow">Cloudflare-native interactive publication runtime</p>
		<h1>{projectTitle}</h1>
		<p class="lede">
			2027.science is a web-native reader and authoring lab: semantic text first, then
			browser-native overlays, highlights, animation, local Mask profiles, and optional AI-assisted
			discovery.
		</p>
		<div class="actions">
			<a class="button" href={resolve('/reader-demo')}>Open reader demo</a>
			<a class="button" href={resolve('/system-check')}>Check this browser</a>
		</div>
	</section>
	<section class="grid">
		<article class="card">
			<h2>Native overlays</h2>
			<p>
				Popover, dialog, Custom Highlight, and Anchor Positioning replace tooltip frameworks where
				supported.
			</p>
		</article>
		<article class="card">
			<h2>Animation without scroll JS</h2>
			<p>
				Scroll-driven CSS and View Transitions handle motion while respecting reduced-motion
				preferences.
			</p>
		</article>
		<article class="card">
			<h2>Local Mask</h2>
			<p>
				A pseudonymous profile stays on-device unless you explicitly donate a redacted quest
				profile.
			</p>
		</article>
		<article class="card">
			<h2>Provider Scout</h2>
			<p>
				OpenRouter, NVIDIA NIM, Workers AI, LM Studio, llama.cpp, Ollama, and mock providers share a
				small routing abstraction.
			</p>
			<a href={resolve('/provider-scout')}>Review provider scout</a>
		</article>
		<article class="card">
			<h2>Generated routes</h2>
			<p>
				Sidecar manifests in the design inbox compile into safe review routes before any image
				slicing or OCR exists.
			</p>
			<a href={resolve('/generated')}>Open generated index</a>
		</article>
	</section>
</main>

<style>
	.lede {
		font-size: clamp(1.15rem, 2.4vw, 1.6rem);
		max-width: 48rem;
		color: var(--muted);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
</style>
