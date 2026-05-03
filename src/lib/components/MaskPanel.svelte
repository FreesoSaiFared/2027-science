<script lang="ts">
	import { maskStore, pauseMask, resetMask, deleteMask } from '$lib/mask/mask.store';
	import { exportMaskToml } from '$lib/mask/mask.toml';
	import MaskIcon from './MaskIcon.svelte';

	let exported = $state('');
	function exportMask() {
		exported = exportMaskToml($maskStore);
	}
</script>

<section class="panel">
	<h2><MaskIcon mode={$maskStore.mode} /> Local Mask</h2>
	<p><strong>{$maskStore.displayName}</strong> · {$maskStore.mode}</p>
	<p>This profile is local-only unless you explicitly donate a redacted Observatory profile.</p>
	<div class="actions">
		<button onclick={exportMask}>Export TOML</button>
		<button onclick={pauseMask}>Pause</button>
		<button onclick={resetMask}>Reset</button>
		<button onclick={deleteMask}>Delete local copy</button>
	</div>
	{#if exported}
		<textarea readonly rows="12" value={exported}></textarea>
	{/if}
</section>

<style>
	.panel {
		border: 1px solid var(--line);
		border-radius: 1rem;
		padding: 1rem;
		background: var(--panel);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	textarea {
		width: 100%;
		margin-block-start: 1rem;
		font-family: ui-monospace, monospace;
	}
</style>
