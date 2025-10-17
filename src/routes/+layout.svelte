<script lang="ts">
	import '../app.css'
	import faviconSVG from '$lib/assets/favicon.svg'
	import favicon512 from '$lib/assets/favicon-512.png'
	import webManifest from '$lib/assets/site.webmanifest'

	import faviconApple from '$lib/assets/apple-touch-icon.png'

	let { children } = $props()
</script>

<svelte:head>
	<!-- Used for android devices pinning websites -->
	<link rel="manifest" href={webManifest} />

	<title>Dylan Adal's Portfolio</title>

	<!-- Favicon -->
	<link rel="icon" type="image/png" href={faviconSVG}/>

	<!-- Can't seem to get the icon working on safari dev -->
	<link rel="apple-touch-icon" sizes="180x180" href={faviconApple} />
</svelte:head>

{@render children?.()}
