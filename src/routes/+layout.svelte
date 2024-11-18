<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import Navigation from '$lib/components/app/navigation.svelte';
	import type { OnNavigate } from '@sveltejs/kit';
	import '../app.css';

	function delayNavigation(navigation: OnNavigate) {
		if (!document.startViewTransition) return new Promise((res) => setTimeout(res, 500));

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve(void 0);
				await navigation.complete;
			});
		});
	}

	onNavigate(async (navigation) => {
		// do some work immediately before the navigation completes

		// optionally return a promise to delay navigation until it resolves
		await delayNavigation(navigation);
	});
</script>

<app class="h-full w-full">
	<content><slot /></content>
	<control class="fixed bottom-2 z-10 w-full px-3"><Navigation /></control>
</app>
