<script lang="ts">
	import { onMount } from 'svelte';
	import { detectCapabilities } from '$lib/capabilities/detect';
	let explanationOpen = $state(false);
	let highlightSupported = $state(false);
	let popoverSupported = $state(false);
	let viewTransitionSupported = $state(false);
	let anchorSupported = $state(false);

	function toggleExplanation() {
		const change = () => (explanationOpen = !explanationOpen);
		if (viewTransitionSupported && 'startViewTransition' in document)
			document.startViewTransition(change);
		else change();
	}

	function ensureHighlightStyle() {
		if (document.getElementById('reader-highlight-style')) return;
		const style = document.createElement('style');
		style.id = 'reader-highlight-style';
		style.textContent =
			'::highlight(reader-focus) { background: color-mix(in srgb, #ffe15c 75%, transparent); color: inherit; }';
		document.head.appendChild(style);
	}

	function highlightPhrase() {
		if (!highlightSupported) return;
		ensureHighlightStyle();
		const target = document.querySelector('[data-highlight-source]');
		const text = target?.firstChild;
		if (!text) return;
		const content = text.textContent ?? '';
		const start = content.indexOf('ordinary paragraph');
		if (start < 0) return;
		const range = new Range();
		range.setStart(text, start);
		range.setEnd(text, start + 'ordinary paragraph'.length);
		const highlight = new Highlight(range);
		CSS.highlights.set('reader-focus', highlight);
	}

	function showPopover() {
		const pop = document.getElementById('phrase-popover') as HTMLElement | null;
		if (popoverSupported && pop && !pop.matches(':popover-open')) pop.showPopover();
	}

	onMount(async () => {
		const caps = await detectCapabilities();
		highlightSupported = caps.customHighlight;
		popoverSupported = caps.popover;
		viewTransitionSupported = caps.viewTransitions;
		anchorSupported = caps.anchorPositioning;
		highlightPhrase();
	});
</script>

<svelte:head><title>Reader demo · 2027.science</title></svelte:head>
<main class="reader-shell" class:expanded={explanationOpen}>
	<article class="publication">
		<header>
			<p class="eyebrow">Reader runtime demo</p>
			<h1>Text that keeps its shape</h1>
			<p class="dek">
				This page starts as semantic article HTML. Modern browsers add highlights, popovers,
				anchor-positioned overlays, view transitions, and scroll-linked marginalia.
			</p>
		</header>
		<p data-highlight-source onpointerenter={showPopover} class="anchor-phrase">
			An ordinary paragraph can become an instrument panel without becoming a JavaScript app. The
			article remains readable if every experiment fails.
		</p>
		<button popovertarget="phrase-popover" onclick={showPopover}>Explain highlighted phrase</button>
		<aside id="phrase-popover" popover class:anchored={anchorSupported}>
			<strong>Native overlay:</strong> This card uses Popover API when supported. CSS Anchor Positioning
			is requested as a progressive enhancement; otherwise it remains a normal top-layer card.
		</aside>
		<p>
			Marginal notes fade and slide as their section enters the viewport using scroll-driven CSS
			where available. Without it, they are static notes.
		</p>
		<aside class="margin-note">Scroll-linked marginal note, no scroll handler required.</aside>
		<button onclick={toggleExplanation}
			>{explanationOpen ? 'Collapse' : 'Expand'} explanation mode</button
		>
		{#if explanationOpen}
			<section class="explanation card">
				<h2>Explanation mode</h2>
				<p>
					View Transitions animate this state change when available. Reduced-motion users keep a
					simple state swap.
				</p>
			</section>
		{/if}
	</article>
	<section class="capability-card card">
		<h2>Runtime fallbacks</h2>
		<ul>
			<li>Custom Highlight: {highlightSupported ? 'native' : 'fallback text only'}</li>
			<li>Popover: {popoverSupported ? 'native' : 'inline/fallback'}</li>
			<li>Anchor Positioning: {anchorSupported ? 'native candidate' : 'viewport card'}</li>
			<li>View Transitions: {viewTransitionSupported ? 'native' : 'instant'}</li>
		</ul>
	</section>
</main>

<style>
	.reader-shell {
		display: grid;
		grid-template-columns: minmax(0, 72ch) minmax(220px, 1fr);
		gap: 2rem;
		align-items: start;
	}
	.publication {
		font-family: ui-serif, Georgia, serif;
		font-size: clamp(1.08rem, 1.4vw, 1.28rem);
	}
	.publication h1 {
		max-width: none;
	}
	.dek {
		color: var(--muted);
		font-family: inherit;
	}
	.anchor-phrase {
		anchor-name: --ordinary-paragraph;
	}
	#phrase-popover {
		max-width: 24rem;
		border: 1px solid var(--line);
		border-radius: 1rem;
		padding: 1rem;
		box-shadow: 0 1rem 3rem #0002;
	}
	@supports (position-anchor: --ordinary-paragraph) {
		#phrase-popover.anchored {
			position: absolute;
			position-anchor: --ordinary-paragraph;
			top: anchor(bottom);
			left: anchor(left);
		}
	}
	.margin-note {
		border-inline-start: 3px solid var(--accent);
		padding-inline-start: 1rem;
		color: var(--muted);
	}
	@supports (animation-timeline: view()) {
		.margin-note {
			animation: note-reveal both linear;
			animation-timeline: view();
			animation-range: entry 10% cover 45%;
		}
		@keyframes note-reveal {
			from {
				opacity: 0.15;
				transform: translateY(1rem);
			}
			to {
				opacity: 1;
				transform: none;
			}
		}
	}
	@view-transition {
		navigation: auto;
	}
	.capability-card {
		position: sticky;
		top: 4rem;
	}
	@media (max-width: 800px) {
		.reader-shell {
			grid-template-columns: 1fr;
		}
		.capability-card {
			position: static;
		}
	}
</style>
