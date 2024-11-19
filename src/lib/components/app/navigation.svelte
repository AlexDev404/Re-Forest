<script lang="ts">
	import { page } from '$app/stores';
	import * as Menubar from '$lib/components/vendor/ui/navigator';
	import { CirclePlus, Cog, House, MapPin, Trees } from 'lucide-svelte';
	import { onMount } from 'svelte';
// Import SvelteKit's navigator
	import { goto } from '$app/navigation';
	let activeButton: string;

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
			on:click={() => handleNavigation('')}
			on:click={() => activeButton === 'home'}
			class={activeButton === 'home' || activeButton === '' ? 'bg-accent' : ''}
			><House /></Menubar.Trigger
		>
		<Menubar.Trigger
			on:click={() => handleNavigation('view')}
			class={activeButton === 'view' ? 'bg-accent' : ''}><MapPin /></Menubar.Trigger
		>
		<Menubar.Trigger
			on:click={() => handleNavigation('add')}
			class="{activeButton === 'add' ? 'bg-accent' : ''} w-20 justify-center"
			><CirclePlus /></Menubar.Trigger
		>
		<Menubar.Trigger
			on:click={() => handleNavigation('explore')}
			class={activeButton === 'explore' ? 'bg-accent' : ''}><Trees /></Menubar.Trigger
		>
		<Menubar.Trigger
			on:click={() => handleNavigation('configure')}
			class={activeButton === 'configure' ? 'bg-accent' : ''}><Cog /></Menubar.Trigger
		>
	</Menubar.Menu>
</Menubar.Root>

<style>
	.active {
		background-color: hsl(var(--accent));
	}
</style>
