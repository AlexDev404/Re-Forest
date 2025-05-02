<script lang="ts">
	import * as Alert from '$lib/components/vendor/ui/alert';
	import * as Dialog from '$lib/components/vendor/ui/dialog';
	import { type Tree } from '$lib/types/Tree';
	import { BadgePlus, Search, Filter } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { inview } from 'svelte-inview';
	
	let trees = [];
	let filteredTrees = [];
	let searchQuery = '';
	let locationElement: HTMLDivElement;
	let data: any;
	let showFilters = false;
	let healthFilter = 'all';
	let dateFilter = 'all';
	let heightFilter = 'all';

	async function fetchTrees() {
		try {
			const params = new URLSearchParams();
			if (searchQuery) params.append('q', searchQuery);
			if (healthFilter !== 'all') params.append('health', healthFilter);
			if (dateFilter !== 'all') params.append('date', dateFilter);
			if (heightFilter !== 'all') params.append('height', heightFilter);

			const response = await fetch(`/api/trees?${params.toString()}`);
			if (!response.ok) throw new Error('Failed to fetch trees');
			
			const data = await response.json();
			trees = data;
			filteredTrees = trees;
		} catch (error) {
			console.error('Error fetching trees:', error);
			filteredTrees = [];
		}
	}

	function searchTrees(query: string) {
		searchQuery = query;
		fetchTrees();
	}

	//this function converts meters to feet
	function metersToFeet(meters: number) {
		let height =
			localStorage.getItem('units') === 'false'
				? meters.toFixed(2).toString() + ' metres'
				: (meters * 3.28084).toFixed(2).toString() + ' ft';
		return height;
	}
	
	let controller = new AbortController();
	let signal_ready: boolean = false;

	onMount(async () => {
		await fetchTrees();
		setTimeout(() => {
			signal_ready = true;
		}, 3000);
	});

	function getHealthDots(health: string): number {
		switch (health) {
			case 'poor':
				return 1;
			case 'fair':
				return 2;
			case 'good':
				return 3;
			case 'excellent':
				return 4;
			default:
				return 1;
		}
	}

	function getHealthColor(health: string): string {
		switch (health) {
			case 'poor':
				return 'hsl(0, 70%, 50%)';  // Red
			case 'fair':
				return 'hsl(30, 70%, 50%)';  // Orange
			case 'good':
				return 'hsl(120, 70%, 50%)';  // Green
			case 'excellent':
				return 'hsl(150, 70%, 50%)';  // Emerald
			default:
				return 'hsl(0, 70%, 50%)';
		}
	}
</script>

<svelte:head>
	<title>Re:Forest :: Explore</title>
</svelte:head>

<page>
	<div class="h-screen snap-y snap-mandatory overflow-y-scroll">
		<!-- Search Bar and Filters -->
		<div class="sticky top-0 z-50 w-full bg-white p-4 shadow-md">
			<div class="mx-auto max-w-md space-y-4">
				<div class="relative">
					<input
						type="text"
						bind:value={searchQuery}
						on:input={() => searchTrees(searchQuery)}
						placeholder="Search trees by name, planter, or health..."
						class="w-full rounded-lg border border-green-200 px-4 py-2 pl-10 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
					/>
					<Search class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500" />
					<button
						on:click={() => showFilters = !showFilters}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
					>
						<Filter class="h-5 w-5" />
					</button>
				</div>
				
				{#if showFilters}
					<div class="grid grid-cols-2 gap-4 rounded-lg border border-green-100 bg-green-50/50 p-4 shadow-sm">
						<div class="space-y-2">
							<label class="block text-sm font-medium text-green-800">Health</label>
							<select
								bind:value={healthFilter}
								on:change={() => searchTrees(searchQuery)}
								class="w-full rounded-md border border-green-200 bg-white p-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
							>
								<option value="all">All Health</option>
								<option value="poor">Poor</option>
								<option value="fair">Fair</option>
								<option value="good">Good</option>
								<option value="excellent">Excellent</option>
							</select>
						</div>
						
						<div class="space-y-2">
							<label class="block text-sm font-medium text-green-800">Planted</label>
							<select
								bind:value={dateFilter}
								on:change={() => searchTrees(searchQuery)}
								class="w-full rounded-md border border-green-200 bg-white p-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
							>
								<option value="all">All Time</option>
								<option value="week">Last Week</option>
								<option value="month">Last Month</option>
								<option value="year">Last Year</option>
							</select>
						</div>
						
						<div class="space-y-2">
							<label class="block text-sm font-medium text-green-800">Height</label>
							<select
								bind:value={heightFilter}
								on:change={() => searchTrees(searchQuery)}
								class="w-full rounded-md border border-green-200 bg-white p-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
							>
								<option value="all">All Heights</option>
								<option value="short">Short (&lt; 10m)</option>
								<option value="medium">Medium (10-20m)</option>
								<option value="tall">Tall (&gt; 20m)</option>
							</select>
						</div>
					</div>
				{/if}
			</div>
		</div>
		<main class="flex flex-col">
			<div class="flex flex-col">
				{#if filteredTrees.length === 0}
					<div class="flex h-screen flex-col items-center justify-center bg-green-50 p-4 text-center">
						<div class="rounded-lg bg-white p-8 shadow-lg">
							<h2 class="mb-4 text-2xl font-semibold text-gray-800">No trees found</h2>
							<p class="text-gray-600">
								{#if healthFilter !== 'all' || dateFilter !== 'all' || heightFilter !== 'all' || searchQuery}
									No trees match your current filters. Try adjusting your search criteria or filters.
								{:else}
									There are no trees in the database yet.
								{/if}
							</p>
							{#if healthFilter !== 'all' || dateFilter !== 'all' || heightFilter !== 'all' || searchQuery}
								<button
									on:click={() => {
										healthFilter = 'all';
										dateFilter = 'all';
										heightFilter = 'all';
										searchQuery = '';
										fetchTrees();
									}}
									class="mt-4 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
								>
									Clear all filters
								</button>
							{/if}
						</div>
					</div>
				{:else}
					{#each filteredTrees as tree, index}
						<tree id="tree__{index}" class="relative h-screen snap-start bg-green-50">
							<img
								class="h-full w-full object-cover"
								loading="lazy"
								src={tree.image}
								alt={tree.name}
							/>
							<information-container>
								<div class="absolute left-0 right-0 top-0 bg-black bg-opacity-50 p-4 text-white">
									<h1 class="mb-1 text-3xl font-bold">{tree.name}</h1>
									<p>{tree.description}</p>
									<div>
										<div
											class="location-data mb-2 text-sm font-light"
											use:inview
											on:inview_enter={(isVisible) => {
												if (isVisible && !tree.location_readable) {
													fetch(
														`https://geocode.maps.co/reverse?format=jsonv2&lat=${tree.lat}&lon=${tree.lng}&api_key=67383f9b5a5d8533348772gbf5de3c7`,
														{ signal: controller.signal }
													)
														.then((r) => r.json())
														.then((d) => {
															data = d;
															tree.location_readable = data.display_name;
														})
														.catch((err) => {
															if (err.name === 'AbortError') {
																console.log('Fetch aborted');
															} else {
																console.error('Fetch error:', err);
															}
														});
												}
											}}
											on:inview_leave={(event) => {
												if (
													document.getElementById(`tree__${index}`)?.getBoundingClientRect().top <
													window.innerHeight
												) {
													return;
												}
												if (
													(event.scrollDirection =
														('down' && index === 1) || index === 0 || !signal_ready || !index)
												) {
													return;
												}
												controller.abort();
												controller = new AbortController();
												console.log(event, 'This div is not in view');
											}}
											bind:this={locationElement}
										>
											{#if tree.location_readable}
												{tree.location_readable}
											{:else}
												Location unavailable.
											{/if}
										</div>
									</div>
									<div
										class="tree_health my-4 flex items-center justify-start space-x-3 rounded-md border border-background px-2 py-2"
									>
										<!-- Display the health as dots -->
										<div class="dots flex items-center justify-start space-x-2">
											{#each Array(getHealthDots(tree.health)) as _, i}
												<span
													class="dot h-4 w-4 rounded-full"
													style="background-color: {getHealthColor(tree.health)}"
												/>
											{/each}
										</div>
										<p class="w-full pr-2 text-right font-semibold capitalize">
											{tree.health}
										</p>
									</div>
									<Dialog.Root>
										<Dialog.Trigger class="font-light underline">More details</Dialog.Trigger>

										<Dialog.Content class="max-w-[250px] rounded-lg" id="add-tree">
											<Dialog.Header>
												<Dialog.Title>Tree details</Dialog.Title>
											</Dialog.Header>
											<div class="text-md">
												<p>Height: <b>{metersToFeet(parseFloat(tree.height))}</b></p>
												<p>Age: <b>{tree.age}</b></p>
											</div>
										</Dialog.Content>
									</Dialog.Root>
								</div>
								<div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-25 p-4 pb-20">
									<Alert.Root>
										<BadgePlus />
										<div class="mx-2 mt-1">
											<Alert.Title>Planted by</Alert.Title>
											<Alert.Description>{tree.plantedBy} on {tree.plantedOn}</Alert.Description>
										</div>
									</Alert.Root>
								</div>
							</information-container>
						</tree>
					{/each}
				{/if}
			</div>
		</main>
	</div>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
