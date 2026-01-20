<script lang="ts">
	import Navigation from '$lib/components/app/navigation.svelte';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	const { data }: PageProps = $props();
	onMount(() => {
		document.documentElement.style = 'background: #576375;';
	});

	let mobile: boolean = $state(false);
	onMount(() => {
		if (typeof window !== 'undefined') {
			mobile = window.localStorage.getItem('mobile') === 'true';
		}
	});
</script>

<slot />

<control class="fixed bottom-2 z-10 w-full px-3 {mobile ? '' : 'lg:hidden'}"
	><Navigation user={data.user} /></control
>
