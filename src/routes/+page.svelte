<script lang="ts">
	import { onMount } from 'svelte'
	import init from '$lib/pkg/simulation.js'

	let canvas

	onMount(async () => {
		await init()
		console.log('WASM loaded.')
	})
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<div id="wasm">
	<canvas bind:this={canvas} id="canvas"></canvas>
</div>
