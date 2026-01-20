<script>
	import { onMount } from 'svelte';

	onMount(() => {
		document.documentElement.removeAttribute('style');
	});
</script>

<slot />
