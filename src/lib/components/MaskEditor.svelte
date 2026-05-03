<script lang="ts">
	import { maskStore, importMask, updateMask } from '$lib/mask/mask.store';
	let importText = $state('');
	let interestText = $state($maskStore.interests.join(', '));

	function save() {
		updateMask((mask) => ({
			...mask,
			mode: 'local-profile',
			interests: interestText
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean)
		}));
	}
</script>

<section class="editor">
	<h2>Edit Mask</h2>
	<label
		>Display name <input
			value={$maskStore.displayName}
			oninput={(event) =>
				updateMask((mask) => ({ ...mask, displayName: event.currentTarget.value }))}
		/></label
	>
	<label
		>Interests <input bind:value={interestText} placeholder="web primitives, translation" /></label
	>
	<button onclick={save}>Save locally</button>
	<label>Import TOML<textarea bind:value={importText} rows="8"></textarea></label>
	<button onclick={() => importMask(importText)}>Import local profile</button>
</section>

<style>
	.editor {
		display: grid;
		gap: 0.8rem;
		border: 1px solid var(--line);
		border-radius: 1rem;
		padding: 1rem;
	}
	label {
		display: grid;
		gap: 0.25rem;
	}
	input,
	textarea {
		font: inherit;
		padding: 0.55rem;
		border-radius: 0.5rem;
		border: 1px solid var(--line);
		background: white;
		color: #111;
	}
</style>
