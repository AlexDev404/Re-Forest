<script lang="ts">
	import { PUBLIC_DEBUG, PUBLIC_GEOCODE_API_KEY } from '$env/static/public';
	import * as Alert from '$lib/components/vendor/ui/alert';
	import * as Dialog from '$lib/components/vendor/ui/dialog';
	import { typical_development_notice } from '$lib/utility/typicals';
	import { BadgePlus } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { inview } from 'svelte-inview';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	if (PUBLIC_DEBUG) {
		typical_development_notice();
		console.log('PageData:', data);
		console.log(data.trees);
	}
	let trees = data.trees;

	let controller = new AbortController();
	let signal_ready: boolean = false;

	// Temporary local location cache
	let locations: Record<number, string> = $state({});

	function metersToFeet(meters: number) {
		return localStorage.getItem('units') === 'false'
			? meters.toFixed(2) + ' metres'
			: (meters * 3.28084).toFixed(2) + ' ft';
	}

	function getHealthScore(health: string): number {
		// Parse numeric value from health string
		// Attempt to extract any number from the health string
		let parsed = 0;
		// Health statuses are now determined by the health score values
		if (health.toUpperCase().includes('POOR')) parsed = 60;
		if (health.toUpperCase().includes('FAIR')) parsed = 75;
		if (health.toUpperCase().includes('GOOD')) parsed = 90;
		if (health.toUpperCase().includes('EXCELLENT')) parsed = 120;
		return Number.isFinite(parsed) ? parsed : 0;
	}

	function getHealthStatus(score: number): string {
		if (score < 60) return 'Poor';
		if (score < 90) return 'Fair';
		if (score < 120) return 'Good';
		return 'Excellent';
	}

	// Format date to be more readable
	function formatDate(dateString: string) {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch (e) {
			return dateString;
		}
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
				{#if !trees}
					<div class="flex h-screen items-center justify-center">
						<p class="text-2xl font-semibold">No trees found</p>
					</div>
				{/if}
				{#each trees as tree, index}
					<tree id="tree__{index}" class="relative h-screen snap-start bg-green-50">
						<img
							class="h-full w-full object-cover"
							loading="lazy"
							src={tree.Image}
							alt={tree.TreeName}
						/>
						<information-container>
							<div
								class="absolute left-0 right-0 top-0 bg-black bg-opacity-50 p-4 text-white backdrop-blur-sm"
							>
								<h1 class="mb-1 text-3xl font-bold">{tree.TreeName}</h1>
								<div
									class="location-data mb-2 text-sm font-light"
									use:inview
									oninview_enter={async (isVisible) => {
										if (isVisible && !locations[tree.Id]) {
											try {
												const res = await fetch(
													`https://geocode.maps.co/reverse?format=jsonv2&lat=${tree.Lat}&lon=${tree.Lng}&api_key=${PUBLIC_GEOCODE_API_KEY}`,
													{ signal: controller.signal }
												);
												const data = await res.json();
												locations[tree.Id] = data.display_name ?? 'Unknown location';
											} catch (err) {
												if (err instanceof Error ? err.name !== 'AbortError' : err?.toString())
													console.error(err);
											}
										}
									}}
									oninview_leave={(event) => {
										const top = document
											.getElementById(`tree__${index}`)
											?.getBoundingClientRect().top;
										if (!top) return;
										if (top < window.innerHeight || !signal_ready || index <= 1) return;
										controller.abort();
										controller = new AbortController();
									}}
								>
									{#if locations[tree.Id]}
										{locations[tree.Id]}
									{:else}
										📍 Location unavailable
									{/if}
								</div>

								<!-- Tree Health Indicator -->
								<div
									class="tree_health my-4 flex items-center justify-between rounded-md border border-white/20 bg-black/30 px-3 py-2 backdrop-blur-sm"
								>
									<div class="dots flex items-center space-x-2">
										{#each Array(Math.round(getHealthScore(tree.Health) / 20)) as _, i}
											<span
												class="dot h-4 w-4 rounded-full"
												style="background-color: {`hsl(${i * 30}, 70%, 50%)`}"
											></span>
										{/each}
									</div>
									<p class="w-full pr-2 text-right font-semibold">
										Health: {getHealthStatus(getHealthScore(tree.Health))}
									</p>
								</div>

								<!-- Tree Details Dialog -->
								<Dialog.Root>
									<Dialog.Trigger
										class="rounded-md bg-white/20 px-3 py-1.5 font-medium text-white hover:bg-white/30"
									>
										More details
									</Dialog.Trigger>
									<Dialog.Content class="max-w-[300px] rounded-lg" id="tree-details">
										<Dialog.Header>
											<Dialog.Title>{tree.TreeName} details</Dialog.Title>
										</Dialog.Header>
										<div class="grid gap-2 py-2">
											<p>Height: <b>{metersToFeet(tree.Height)}</b></p>
											<p>Age: <b>{tree.Age}</b></p>
											<p>Health: <b>{tree.Health}</b></p>
											{#if tree.Lat && tree.Lng}
												<p>
													Location: <b
														>{locations[tree.Id]
															? locations[tree.Id]
															: '📍 Location unavailable'}</b
													>
												</p>
											{/if}
											<p>Planted on: <b>{formatDate(tree.PlantedOn)}</b></p>
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
