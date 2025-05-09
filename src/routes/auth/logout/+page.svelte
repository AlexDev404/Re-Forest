<script>
	import { onMount } from 'svelte';

	// Reload the page
	onMount(() => {
		setTimeout(() => {
			window.location.href = '/';
		}, 3000);
	});
</script>

<div class="flex h-screen items-center justify-center">
	<div class="text-center">
		<h1 class="mb-4 text-2xl font-bold">It's a good idea to close other open windows.</h1>
		<p class="mb-6">You will be redirected shortly...</p>
		<p>
			If you are not redirected, <a href="/" class="text-blue-500 hover:underline"
				>click here to return to the homepage</a
			>.
		</p>
	</div>
</div>
