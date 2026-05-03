<script lang="ts">
	let { mode = 'anonymous' }: { mode?: string } = $props();
</script>

<span class="mask-icon" aria-label={`Mask mode: ${mode}`} title={`Mask mode: ${mode}`}>◉</span>

<style>
	.mask-icon {
		display: inline-grid;
		place-items: center;
		inline-size: 1.7rem;
		block-size: 1.7rem;
		border: 1px solid currentColor;
		border-radius: 999px;
		font-size: 0.9rem;
	}
</style>
