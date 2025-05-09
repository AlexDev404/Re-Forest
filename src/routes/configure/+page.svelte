<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/vendor/ui/button/index';
	import { Label } from '$lib/components/vendor/ui/label/index';
	import MenuItem from '$lib/components/vendor/ui/menuitem/menuitem.svelte';
	import { Switch } from '$lib/components/vendor/ui/switch/index';
	import { ChevronRight, DoorOpen, HelpCircle, Map, Shield, Thermometer } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	let Units: Switch;
	let checked: boolean = $state(false);
	const { data }: PageProps = $props();

	onMount(() => {
		const unitcheck: boolean = JSON.parse(localStorage.getItem('units') ?? 'false');
		const is_unset = localStorage.getItem('units') === null;
		checked = true; // Default value
		if (!unitcheck && !is_unset) {
			checked = unitcheck;
		}
	});

	function onclick_units() {
		checked = !checked; // Toggle the switch on or off
		// this is a function to get the current state of the switch and save it to local storage
		const dataset = checked;
		localStorage.setItem('units', JSON.stringify(dataset));
	}
</script>

<svelte:head>
	<title>Re:Forest :: Settings</title>
</svelte:head>
<page class="overflow-y-auto">
	<main class="mx-6 my-10 flex min-h-[80vh] flex-col items-start gap-9">
		<article class="flex flex-col items-start self-stretch">
			<h1 class="text-2xl font-semibold">Settings</h1>
		</article>
		<optionsList class="flex w-full flex-col items-start gap-2">
			<MenuItem title="Unit Scale" onclick={onclick_units}>
				<svelte:fragment slot="start-icon">
					<Thermometer class="h-4 w-4" />
				</svelte:fragment>

				<div
					tabindex="-1"
					role="button"
					class="flex items-center space-x-2"
					onclick={onclick_units}
					onkeydown={(e) => e.key === 'Enter' && onclick_units()}
					aria-label="Toggle Units"
				>
					<Label for="Units">Metric</Label>
					<Switch bind:checked id="Units" bind:this={Units} />
					<Label for="Units">Imperial</Label>
				</div>
			</MenuItem>

			<MenuItem onclick={() => goto('/configure/site-location')} title="Site Location">
				<svelte:fragment slot="start-icon">
					<Map class="h-4 w-4" />
				</svelte:fragment>
				<ChevronRight class="h-4 w-4" />
			</MenuItem>

			{#if data.authenticated === false}
				<MenuItem onclick={() => goto('/auth/login')} title="Sign In">
					<svelte:fragment slot="start-icon">
						<Shield class="h-4 w-4" />
					</svelte:fragment>
					<ChevronRight class="h-4 w-4" />
				</MenuItem>
			{:else}
				<MenuItem onclick={() => goto('/auth/logout')} title="Sign Out" class="text-destructive">
					<svelte:fragment slot="start-icon">
						<DoorOpen class="h-4 w-4" />
					</svelte:fragment>
					<ChevronRight class="h-4 w-4" />
				</MenuItem>
			{/if}
		</optionsList>
		<div class="flex w-full flex-1 flex-col items-end justify-end">
			<Button variant="link" href="/configure/help" class="flex w-full border border-primary px-0">
				<MenuItem title="Help">
					<svelte:fragment slot="start-icon">
						<HelpCircle class="h-4 w-4" />
					</svelte:fragment>
					<ChevronRight class="h-4 w-4" />
				</MenuItem>
			</Button>
		</div>
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
