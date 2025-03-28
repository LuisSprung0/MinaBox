<script>
	import '../app.css';
	import ThemeProvider from '$lib/components/ui/themes/ThemeProvider.svelte';

	let { children } = $props();
</script>

<ThemeProvider>
	{@render children()}
</ThemeProvider>

