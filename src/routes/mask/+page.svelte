<script lang="ts">
	import FirstVisitMaskPopover from '$lib/components/FirstVisitMaskPopover.svelte';
	import MaskEditor from '$lib/components/MaskEditor.svelte';
	import MaskPanel from '$lib/components/MaskPanel.svelte';
</script>

<main>
	<FirstVisitMaskPopover />
	<section class="hero compact">
		<p class="eyebrow">Local pseudonymous profile</p>
		<h1>Mask</h1>
		<p>Anonymous Mode is the default. Timeout or inactivity never means consent.</p>
	</section>
	<div class="grid"><MaskPanel /><MaskEditor /></div>
</main>

<style>
	.compact {
		padding-block: 2rem;
	}
</style>
