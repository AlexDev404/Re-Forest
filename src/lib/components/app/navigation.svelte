<script lang="ts">
	import { page } from '$app/stores';
	import * as Menubar from '$lib/components/vendor/ui/navigator';
	import { CirclePlus, Cog, House } from 'lucide-svelte';
	import { onMount } from 'svelte';
// Import SvelteKit's navigator
	import { goto } from '$app/navigation';
	let activeButton: string = $state('home');

	const { user } = $props();

	onMount(() => {
		// Set activeButton to the resource of the URL
		activeButton = $page.route.id ?? 'home';
		// remove any slashes from the activeButton
		activeButton = activeButton.replace(/\//g, '');
		if (activeButton === '') activeButton = 'home';
		// console.log(activeButton);
	});

	function handleNavigation(page: string) {
		activeButton = page;
		goto(`/${page}`);
	}
</script>

<Menubar.Root class="w-full">
	<Menubar.Menu>
		<Menubar.Trigger
			onclick={() => handleNavigation('')}
			class={activeButton === 'home' || activeButton === '' ? 'bg-secondary' : ''}
			><House /></Menubar.Trigger
		>

		{#if user.Role !== 3}
			<Menubar.Trigger
				onclick={() => handleNavigation('manage/add')}
				class="{activeButton === 'manage/add' || activeButton === 'manageadd' ? 'bg-secondary' : ''} w-20 justify-center"
				><CirclePlus /></Menubar.Trigger
			>
		{/if}
		
		<Menubar.Trigger
			onclick={() => handleNavigation('configure')}
			class={activeButton === 'configure' ? 'bg-secondary' : ''}><Cog /></Menubar.Trigger
		>
	</Menubar.Menu>
</Menubar.Root>

<style>
	.active {
		background-color: hsl(var(--accent));
	}
</style>
