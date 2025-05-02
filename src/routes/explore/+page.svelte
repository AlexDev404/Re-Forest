<script lang="ts">
	import * as Alert from '$lib/components/vendor/ui/alert';
	import * as Dialog from '$lib/components/vendor/ui/dialog';
	import { BadgePlus } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { inview } from 'svelte-inview';
	import type { PageData } from './$types';

	const data: PageData = $props();
	let trees = data.trees;

	let controller = new AbortController();
	let signal_ready: boolean = false;

	// Temporary local location cache
	let locations: Record<number, string> = {};

	function metersToFeet(meters: number) {
		return localStorage.getItem('units') === 'false'
			? meters.toFixed(2) + ' metres'
			: (meters * 3.28084).toFixed(2) + ' ft';
	}

	function getHealthScore(health: string): number {
		const parsed = parseInt(health.replace(/[^0-9]/g, ''));
		return Number.isFinite(parsed) ? parsed : 0;
	}

	function getHealthStatus(score: number): string {
		if (score < 60) return 'Poor';
		if (score < 90) return 'Fair';
		if (score <= 120) return 'Good';
		return 'Excellent';
	}

	onMount(() => {
		setTimeout(() => {
			signal_ready = true;
		}, 3000);
	});
</script>

  <svelte:head>
	<title>Re:Forest :: Explore</title>
  </svelte:head>
  
  <page>
	<div class="h-screen snap-y snap-mandatory overflow-y-scroll">
	  <main class="flex flex-col">
		<div class="flex flex-col">
			{#each trees as tree, index}
			<tree id="tree__{index}" class="relative h-screen snap-start bg-green-50">
			  <img
				class="h-full w-full object-cover"
				loading="lazy"
				src={tree.Image}
				alt={tree.TreeName}
			  />
			  <information-container>
				<div class="absolute left-0 right-0 top-0 bg-black bg-opacity-50 p-4 text-white">
				  <h1 class="mb-1 text-3xl font-bold">{tree.TreeName}</h1>
				  <p>{tree.Health}</p>
		  
				  <div
					class="location-data mb-2 text-sm font-light"
					use:inview
					on:inview_enter={async (isVisible) => {
					  if (isVisible && !locations[tree.Id]) {
						try {
						  const res = await fetch(
							`https://geocode.maps.co/reverse?format=jsonv2&lat=${tree.Lat}&lon=${tree.Lng}`,
							{ signal: controller.signal }
						  );
						  const data = await res.json();
						  locations[tree.Id] = data.display_name ?? 'Unknown location';
						} catch (err) {
						  if (err.name !== 'AbortError') console.error(err);
						}
					  }
					}}
					on:inview_leave={(event) => {
					  const top = document.getElementById(`tree__${index}`)?.getBoundingClientRect().top;
					  if (top < window.innerHeight || !signal_ready || index <= 1) return;
					  controller.abort();
					  controller = new AbortController();
					}}
				  >
					{#if locations[tree.Id]}
					  {locations[tree.Id]}
					{:else}
					  Location unavailable.
					{/if}
				  </div>
		  
				  <div class="tree_health my-4 flex items-center justify-start space-x-3 rounded-md border border-background px-2 py-2">
					<div class="dots flex items-center justify-start space-x-2">
					  {#each Array(Math.round(getHealthScore(tree.Health) / 20)) as _, i}
						<span class="dot h-4 w-4 rounded-full" style="background-color: {`hsl(${i * 30}, 70%, 50%)`}"/>
					  {/each}
					</div>
					<p class="w-full pr-2 text-right font-semibold">
					  {getHealthStatus(getHealthScore(tree.Health))}
					</p>
				  </div>
		  
				  <Dialog.Root>
					<Dialog.Trigger class="font-light underline">More details</Dialog.Trigger>
					<Dialog.Content class="max-w-[250px] rounded-lg" id="add-tree">
					  <Dialog.Header>
						<Dialog.Title>Tree details</Dialog.Title>
					  </Dialog.Header>
					  <div class="text-md">
						<p>Height: <b>{metersToFeet(tree.Height)}</b></p>
						<p>Age: <b>{tree.Age}</b></p>
					  </div>
					</Dialog.Content>
				  </Dialog.Root>
				</div>
		  
				<div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-25 p-4 pb-20">
				  <Alert.Root>
					<BadgePlus />
					<div class="mx-2 mt-1">
					  <Alert.Title>Planted by</Alert.Title>
					  <Alert.Description>{tree.PlantedBy} on {tree.PlantedOn}</Alert.Description>
					</div>
				  </Alert.Root>
				</div>
			  </information-container>
			</tree>
		  {/each}		  
		</div>
	  </main>
	</div>
  </page>
  
  <style>
	:global(body) {
	  overflow: auto;
	}
  </style>
  