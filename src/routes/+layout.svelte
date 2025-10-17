<script lang="ts">
	import '../app.css'
	import faviconSVG from '$lib/assets/favicon.svg'
	import faviconApple from '$lib/assets/favicon-apple.png'
	import webManifest from '$lib/assets/site.webmanifest'

	let { children } = $props()
</script>

<svelte:head>
	<!-- Used for android devices pinning websites -->
	<link rel="manifest" href={webManifest} />

	<title>Dylan Adal's Portfolio</title>

	<!-- Standard favicon -->
	<link rel="icon" type="image/svg+xml" href={faviconSVG}/>

	<!-- Can't seem to get the icon working on safari dev -->
	<link rel="apple-touch-icon" href={faviconApple} />
</svelte:head>

{@render children?.()}
