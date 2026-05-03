<script lang="ts">
	let open = $state(false);
	function close() {
		open = false;
		localStorage.setItem('2027.science.mask.intro.seen', '1');
	}
	if (typeof localStorage !== 'undefined' && !localStorage.getItem('2027.science.mask.intro.seen'))
		open = true;
</script>

{#if open}
	<section class="intro" popover="manual">
		<h2>Anonymous Mode is on</h2>
		<p>
			The Mask starts local and pseudonymous. Inactivity never implies consent. Observatory donation
			is opt-in only.
		</p>
		<button onclick={close}>Continue</button>
	</section>
{/if}

<style>
	.intro {
		position: fixed;
		inset: auto 1rem 1rem auto;
		max-width: 26rem;
		padding: 1rem;
		border: 1px solid var(--line);
		border-radius: 1rem;
		background: Canvas;
		box-shadow: 0 1rem 3rem #0003;
		z-index: 10;
	}
</style>
