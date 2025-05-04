<script lang="ts">
	import { browser } from '$app/environment';
	import { PUBLIC_DEBUG } from '$env/static/public';
	import * as Alert from '$lib/components/vendor/ui/alert';
	import * as Dialog from '$lib/components/vendor/ui/dialog';
	import { type ReverseGeoJSON } from '$lib/types/GeoJSON';
	import { typical_development_notice } from '$lib/utility/typicals';
	import { formatDate, getReverseLoc, metersToFeet } from '$lib/utility/utility';
	import { BadgePlus, Filter, Search } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { inview } from 'svelte-inview';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	if (PUBLIC_DEBUG) {
		typical_development_notice();
		console.log('PageData:', data);
		console.log(data.trees);
	}
	
	// Store the original SSR data
	const originalTrees = data.trees;
	// Current filtered or searched trees
	let filteredTrees = $state(originalTrees);
	
	// Search state
	let searchQuery = $state('');
	let showFilters = $state(false);
	let healthFilter = $state('all');
	let dateFilter = $state('all');
	let heightFilter = $state('all');
	let isSearching = $state(false);

	// Initialize search parameters from URL query params if they exist
	function initSearchFromURL() {
		if (browser) {
			const url = new URL(window.location.href);
			searchQuery = url.searchParams.get('q') || '';
			healthFilter = url.searchParams.get('health') || 'all';
			dateFilter = url.searchParams.get('date') || 'all';
			heightFilter = url.searchParams.get('height') || 'all';
			
			// If any search params exist, we should start with search mode active
			isSearching = !!(searchQuery || healthFilter !== 'all' || dateFilter !== 'all' || heightFilter !== 'all');
		}
	}

	let controller = new AbortController();
	let signal_ready: boolean = false;

	// Temporary local location cache
	let locations: Record<number, string> = $state({});

	// Update URL without triggering navigation
	function updateURL() {
		if (browser) {
			const url = new URL(window.location.href);
			
			// Update URL parameters
			if (searchQuery) {
				url.searchParams.set('q', searchQuery);
			} else {
				url.searchParams.delete('q');
			}
			
			if (healthFilter !== 'all') {
				url.searchParams.set('health', healthFilter);
			} else {
				url.searchParams.delete('health');
			}
			
			if (dateFilter !== 'all') {
				url.searchParams.set('date', dateFilter);
			} else {
				url.searchParams.delete('date');
			}
			
			if (heightFilter !== 'all') {
				url.searchParams.set('height', heightFilter);
			} else {
				url.searchParams.delete('height');
			}
			
			// Replace URL without navigation
			window.history.replaceState({}, '', url.toString());
		}
	}

	async function fetchTrees() {
		try {
			// Check if we have any active filters
			const hasActiveFilters = searchQuery || healthFilter !== 'all' || dateFilter !== 'all' || heightFilter !== 'all';
			
			// If no active filters, restore original SSR data
			if (!hasActiveFilters) {
				filteredTrees = originalTrees;
				isSearching = false;
				updateURL();
				return;
			}
			
			isSearching = true;
			
			// Build params for API request
			const params = new URLSearchParams();
			if (searchQuery) params.append('q', searchQuery);
			if (healthFilter !== 'all') params.append('health', healthFilter);
			if (dateFilter !== 'all') params.append('date', dateFilter);
			if (heightFilter !== 'all') params.append('height', heightFilter);

			const response = await fetch(`/api/trees?${params.toString()}`);
			if (!response.ok) throw new Error('Failed to fetch trees');
			
			const fetchedData = await response.json();
			filteredTrees = fetchedData;
			
			// Update URL to reflect current search state
			updateURL();
		} catch (error) {
			console.error('Error fetching trees:', error);
			filteredTrees = [];
		}
	}

	function clearFilters() {
		searchQuery = '';
		healthFilter = 'all';
		dateFilter = 'all';
		heightFilter = 'all';
		isSearching = false;
		filteredTrees = originalTrees;
		updateURL();
	}

	function getHealthScore(health: string): number {
		// Parse numeric value from health string
		// Attempt to extract any number from the health string
		let parsed = 0;
		// Health statuses are now determined by the health score values
		if (health?.toUpperCase().includes('POOR')) parsed = 60;
		if (health?.toUpperCase().includes('FAIR')) parsed = 75;
		if (health?.toUpperCase().includes('GOOD')) parsed = 90;
		if (health?.toUpperCase().includes('EXCELLENT')) parsed = 120;
		return Number.isFinite(parsed) ? parsed : 0;
	}

	function getHealthStatus(score: number): string {
		if (score < 60) return 'Poor';
		if (score < 90) return 'Fair';
		if (score < 120) return 'Good';
		return 'Excellent';
	}

	// Debounce function to limit API calls
	function debounce(func: Function, timeout = 300) {
		let timer: ReturnType<typeof setTimeout>;
		return (...args: any[]) => {
			clearTimeout(timer);
			timer = setTimeout(() => { func.apply(this, args); }, timeout);
		};
	}
	
	const debouncedSearch = debounce(() => fetchTrees(), 500);

	onMount(async () => {
		initSearchFromURL();
		
		// If search parameters exist in URL, perform search
		if (searchQuery || healthFilter !== 'all' || dateFilter !== 'all' || heightFilter !== 'all') {
			await fetchTrees();
		}
		
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
		<!-- Search Bar and Filters -->
		<div class="sticky top-0 z-50 w-full bg-white p-4 shadow-md">
			<div class="mx-auto max-w-md space-y-4">
				<div class="relative">
					<input
						type="text"
						bind:value={searchQuery}
						on:input={debouncedSearch}
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
								on:change={fetchTrees}
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
								on:change={fetchTrees}
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
								on:change={fetchTrees}
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
									on:click={clearFilters}
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
								src={isSearching ? tree.image : tree.Image}
								alt={isSearching ? tree.name : tree.TreeName}
							/>
							<information-container>
								<div
									class="absolute left-0 right-0 top-0 bg-black bg-opacity-50 p-4 text-white backdrop-blur-sm"
								>
									<h1 class="mb-1 text-3xl font-bold">{isSearching ? tree.name : tree.TreeName}</h1>
									<div
										class="location-data mb-2 text-sm font-light"
										use:inview
										on:inview_enter={async ({ detail: { inView } }) => {
											if (inView && !locations[isSearching ? tree.id : tree.Id]) {
												try {
													const treeId = isSearching ? tree.id : tree.Id;
													const treeLat = isSearching ? tree.lat : tree.Lat;
													const treeLng = isSearching ? tree.lng : tree.Lng;
													
													const data: ReverseGeoJSON | null = await getReverseLoc(
														treeLat,
														treeLng,
														controller
													);
													if (!data) return;
													locations[treeId] = data.name ?? 'Unknown location';
												} catch (err) {
													if (err instanceof Error ? err.name !== 'AbortError' : err?.toString())
														console.error(err);
												}
											}
										}}
										on:inview_leave={({ detail: { entry } }) => {
											const top = document
												.getElementById(`tree__${index}`)
												?.getBoundingClientRect().top;
											if (!top) return;
											if (top < window.innerHeight || !signal_ready || index <= 1) return;
											controller.abort();
											controller = new AbortController();
										}}
									>
										{#if locations[isSearching ? tree.id : tree.Id]}
											{locations[isSearching ? tree.id : tree.Id]}
										{:else}
											📍 Location unavailable
										{/if}
									</div>

									<!-- Tree Health Indicator -->
									<div
										class="tree_health my-4 flex items-center justify-between rounded-md border border-white/20 bg-black/30 px-3 py-2 backdrop-blur-sm"
									>
										<div class="dots flex items-center space-x-2">
											{#each Array(Math.round(getHealthScore(isSearching ? tree.health : tree.Health) / 20)) as _, i}
												<span
													class="dot h-4 w-4 rounded-full"
													style="background-color: {`hsl(${i * 30}, 70%, 50%)`}"
												></span>
											{/each}
										</div>
										<p class="w-full pr-2 text-right font-semibold">
											Health: {getHealthStatus(getHealthScore(isSearching ? tree.health : tree.Health))}
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
												<Dialog.Title>{isSearching ? tree.name : tree.TreeName} details</Dialog.Title>
											</Dialog.Header>
											<div class="grid gap-2 py-2">
												<p>Height: <b>{isSearching ? tree.height : metersToFeet(tree.Height)}</b></p>
												<p>Age: <b>{isSearching ? tree.age : tree.Age}</b></p>
												<p>Health: <b>{isSearching ? tree.health : tree.Health}</b></p>
												{#if (isSearching ? tree.lat : tree.Lat) && (isSearching ? tree.lng : tree.Lng)}
													<p>
														Location: <b
															>{locations[isSearching ? tree.id : tree.Id]
																? locations[isSearching ? tree.id : tree.Id]
																: '📍 Location unavailable'}</b
														>
													</p>
												{/if}
												<p>Planted on: <b>{formatDate(isSearching ? tree.plantedOn : tree.PlantedOn ?? '')}</b></p>
											</div>
										</Dialog.Content>
									</Dialog.Root>
								</div>

								<div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-25 p-4 pb-20">
									<Alert.Root>
										<BadgePlus />
										<div class="mx-2 mt-1">
											<Alert.Title>Planted by</Alert.Title>
											<Alert.Description>
												{#if isSearching}
													{tree.plantedBy} on {formatDate(tree.plantedOn ?? '')}
												{:else}
													{tree.PlantedBy !== null &&
													!('message' in tree.PlantedBy && 'name' in tree.PlantedBy)
														? `${tree.PlantedBy.FirstName} ${tree.PlantedBy.LastName}`
														: 'Deleted User'} on {formatDate(tree.PlantedOn ?? '')}
												{/if}
											</Alert.Description>
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
