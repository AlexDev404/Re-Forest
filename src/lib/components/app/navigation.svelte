<script lang="ts">
	import { page } from '$app/stores';
	import * as Menubar from '$lib/components/vendor/ui/navigator';
	import { BadgeCheck, ChartColumn, CirclePlus, Cog, House, Trees } from 'lucide-svelte';
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
			class={activeButton === 'home' || activeButton === '' ? 'bg-accent' : ''}
			><House /></Menubar.Trigger
		>

		{#if user.Role === 2}
			<Menubar.Trigger
				onclick={() => handleNavigation('configure/reports')}
				class={activeButton === 'reports' ? 'bg-accent' : ''}><ChartColumn /></Menubar.Trigger
			>
		{/if}

		{#if user.Role === 1}
			<Menubar.Trigger
				onclick={() => handleNavigation('verify')}
				class={activeButton === 'verify' ? 'bg-accent' : ''}><BadgeCheck /></Menubar.Trigger
			>
		{/if}

		{#if user.Role !== 3}
			<Menubar.Trigger
				onclick={() => handleNavigation('manage')}
				class="{activeButton === 'manage' ? 'bg-accent' : ''} w-20 justify-center"
				><CirclePlus /></Menubar.Trigger
			>
		{/if}
		<Menubar.Trigger
			onclick={() => handleNavigation('explore')}
			class={activeButton === 'explore' ? 'bg-accent' : ''}><Trees /></Menubar.Trigger
		>
		<Menubar.Trigger
			onclick={() => handleNavigation('configure')}
			class={activeButton === 'configure' ? 'bg-accent' : ''}><Cog /></Menubar.Trigger
		>
	</Menubar.Menu>
</Menubar.Root>

<style>
	.active {
		background-color: hsl(var(--accent));
	}
</style>
