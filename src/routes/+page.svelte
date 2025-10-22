<script lang="ts">
	import { onMount } from 'svelte'
	import init from '$lib/pkg/dylanadal_com_wgpu.js'

	let canvas

	onMount(async () => {
		await init()
		console.log('WASM loaded.')
	})
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<body id="wasm-example" class="p-0 m-0">
	<canvas
	  bind:this={canvas}
	  id="canvas"
	  class="w-[1000px] p-0 m-0"
	></canvas>
  </body>
  
