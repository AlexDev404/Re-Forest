<script lang="ts">
	import { goto } from '$app/navigation';
	import { Label } from '$lib/components/vendor/ui/label/index';
	import MenuItem from '$lib/components/vendor/ui/menuitem/menuitem.svelte';
	import { Switch } from '$lib/components/vendor/ui/switch/index';
	import {
		BarChart2, // Changed from BarChart
		ChevronRight,
		DoorOpen,
		HelpCircle,
		Map,
		Shield,
		Thermometer
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	let Units: Switch;
	let checked: boolean = $state(false);
	const { data }: PageProps = $props();

	onMount(() => {
		const unitcheck: boolean = JSON.parse(localStorage.getItem('units') ?? 'false');
		const is_unset = localStorage.getItem('units') === null;
		checked = true; // Default value, assuming Imperial is default if true
		if (!unitcheck && !is_unset) {
			checked = unitcheck;
		}
	});

	function onclick_units() {
		checked = !checked; 
		const dataset = checked;
		localStorage.setItem('units', JSON.stringify(dataset));
	}
</script>

<svelte:head>
	<title>Greening Belize :: Settings</title>
</svelte:head>
<page class="min-h-screen overflow-y-auto bg-slate-50 dark:bg-slate-900 font-sans">
	<main class="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-16 flex flex-col gap-8 sm:gap-10">
		<header class="pb-6 sm:pb-8">
			<h1 class="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
				Settings
			</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Manage your application preferences and configurations.
			</p>
		</header>
		
		<div class="bg-card shadow rounded-xl border border-border divide-y divide-border overflow-hidden">
			<MenuItem 
				class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-slate-900"
				title="Unit Scale" 
				onclick={onclick_units} 
				
			>
				<svelte:fragment slot="start-icon">
					<Thermometer class="h-5 w-5 text-slate-500 dark:text-slate-400" />
				</svelte:fragment>
				<div
					tabindex="-1"
					role="button"
					class="flex items-center space-x-2 cursor-pointer"
					onclick={onclick_units} 
					onkeydown={(e) => e.key === 'Enter' && onclick_units()}
					aria-label="Toggle Units"
				>
					<Label for="Units" class="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">Metric</Label>
					<Switch bind:checked id="Units" bind:this={Units} />
					<Label for="Units" class="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">Imperial</Label>
				</div>
			</MenuItem>

			<MenuItem 
				class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-slate-900"
				onclick={() => goto('/configure/site-location')} 
				title="Site Location"
				
			>
				<svelte:fragment slot="start-icon">
					<Map class="h-5 w-5 text-slate-500 dark:text-slate-400" />
				</svelte:fragment>
				<ChevronRight class="h-5 w-5 text-slate-400 dark:text-slate-500" />
			</MenuItem>

			{#if data.user && (data.user.Role === 1 || data.user.Role === 2)}
				<MenuItem 
					class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-slate-900"
					onclick={() => goto('/configure/reports')} 
					title="Reports Dashboard"
					
				>
					<svelte:fragment slot="start-icon">
						<BarChart2 class="h-5 w-5 text-slate-500 dark:text-slate-400" />
					</svelte:fragment>
					<ChevronRight class="h-5 w-5 text-slate-400 dark:text-slate-500" />
				</MenuItem>
			{/if}

			<MenuItem 
				class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-slate-900"
				onclick={() => goto('/configure/help')} 
				title="Help & Support"
				
			>
				<svelte:fragment slot="start-icon">
					<HelpCircle class="h-5 w-5 text-slate-500 dark:text-slate-400" />
				</svelte:fragment>
				<ChevronRight class="h-5 w-5 text-slate-400 dark:text-slate-500" />
			</MenuItem>
		</div>

		<div class="bg-card shadow rounded-xl border border-border divide-y divide-border overflow-hidden mt-6 sm:mt-8">
			{#if data.authenticated === false}
				<MenuItem 
					class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-slate-900"
					onclick={() => goto('/auth/login')} 
					title="Sign In"
					
				>
					<svelte:fragment slot="start-icon">
						<Shield class="h-5 w-5 text-slate-500 dark:text-slate-400" />
					</svelte:fragment>
					<ChevronRight class="h-5 w-5 text-slate-400 dark:text-slate-500" />
				</MenuItem>
			{:else}
				<MenuItem 
					class="text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-700/30 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-slate-900"
					onclick={() => goto('/auth/logout')} 
					title="Sign Out"
					
				>
					<svelte:fragment slot="start-icon">
						<DoorOpen class="h-5 w-5" /> 
					</svelte:fragment>
					<ChevronRight class="h-5 w-5" /> 
				</MenuItem>
			{/if}
		</div>
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
	.text-red-600 :global(svg), 
	.dark\:text-red-500 :global(svg) {
		color: currentColor;
	}
	:global(.menuitem-title) {
		@apply text-sm font-medium text-slate-800 dark:text-slate-200;
	}
</style>
