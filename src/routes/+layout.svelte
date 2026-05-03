<script lang="ts">
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="site-nav" aria-label="Primary">
	<a href={resolve('/')}>2027.science</a>
	<a href={resolve('/reader-demo')}>reader demo</a>
	<a href={resolve('/system-check')}>system check</a>
	<a href={resolve('/mask')}>mask</a>
	<a href={resolve('/privacy')}>privacy</a>
	<a href={resolve('/observatory')}>observatory</a>
	<a href={resolve('/provider-scout')}>provider scout</a>
	<a href={resolve('/generated')}>generated</a>
	<a href={resolve('/docs')}>docs</a>
</nav>
{@render children()}

<style>
	.site-nav {
		position: sticky;
		top: 0;
		z-index: 8;
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem;
		align-items: center;
		padding: 0.75rem max(1rem, calc((100vw - 1120px) / 2));
		backdrop-filter: blur(16px);
		background: color-mix(in srgb, #fbfaf7 82%, transparent);
		border-bottom: 1px solid var(--line);
	}
	.site-nav a:first-child {
		margin-inline-end: auto;
		font-weight: 800;
		color: var(--ink);
	}
	.site-nav a {
		text-decoration: none;
		color: var(--muted);
	}
</style>
