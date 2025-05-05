<script lang="ts">
	import { browser } from '$app/environment';
	import { PUBLIC_DEBUG } from '$env/static/public';
	import * as Alert from '$lib/components/vendor/ui/alert';
	import { Button } from '$lib/components/vendor/ui/button';
	import * as Dialog from '$lib/components/vendor/ui/dialog';
	import { Input } from '$lib/components/vendor/ui/input';
	import { type ReverseGeoJSON } from '$lib/types/GeoJSON';
	import { typical_development_notice } from '$lib/utility/typicals';
	import { formatDate, getReverseLoc, metersToFeet } from '$lib/utility/utility';
	import { BadgePlus, Filter, Search, X } from 'lucide-svelte';
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
	let showSearchBar = $state(false); // New state for toggling search UI
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
			isSearching = !!(
				searchQuery ||
				healthFilter !== 'all' ||
				dateFilter !== 'all' ||
				heightFilter !== 'all'
			);
			// Also show the search UI if there are active search params
			showSearchBar = isSearching;
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
			const hasActiveFilters =
				searchQuery || healthFilter !== 'all' || dateFilter !== 'all' || heightFilter !== 'all';

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

	// Toggle search UI visibility
	function toggleSearchUI() {
		showSearchBar = !showSearchBar;
		if (!showSearchBar) {
			// When hiding search, clear filters too if there's no active search
			if (!isSearching) {
				clearFilters();
			}
		}
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
			timer = setTimeout(() => {
				func.apply(null, args);
			}, timeout);
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
		<!-- Search Toggle Button -->
		<div class="fixed right-5 top-5 z-10 md:z-50">
			<Button
				variant="outline"
				size="icon"
				class="rounded-full bg-white/90 shadow-md hover:bg-white"
				onclick={toggleSearchUI}
			>
				{#if showSearchBar}
					<X class="h-5 w-5 text-green-600" />
				{:else}
					<Search class="h-5 w-5 text-green-600" />
				{/if}
			</Button>
		</div>

		<!-- Search Bar and Filters - Conditional Render -->
		{#if showSearchBar}
			<div
				class="fixed left-0 right-0 top-0 z-40 flex flex-col gap-2 bg-white/95 p-4 shadow-md backdrop-blur-sm transition-all"
			>
				<div class="space-y-4 md:mx-auto md:max-w-md">
					<div class="relative">
						<Input
							type="text"
							bind:value={searchQuery}
							oninput={debouncedSearch}
							placeholder="Search trees by name, planter, or health..."
							class="w-full pl-10 focus:border-green-500 focus:ring-green-200"
						/>
						<Search class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500" />
						<Button
							variant="ghost"
							size="icon"
							class="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:bg-green-50 hover:text-green-600"
							onclick={() => (showFilters = !showFilters)}
						>
							<Filter class="h-5 w-5" />
						</Button>
					</div>

					{#if showFilters}
						<div
							class="grid grid-cols-1 gap-4 rounded-lg border border-green-100 bg-green-50/80 p-4 shadow-sm md:grid-cols-3"
						>
							<div class="space-y-2">
								<label for="health-filter" class="block text-sm font-medium text-green-800"
									>Health</label
								>
								<select
									id="health-filter"
									bind:value={healthFilter}
									onchange={() => fetchTrees()}
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
								<label for="date-filter" class="block text-sm font-medium text-green-800"
									>Planted</label
								>
								<select
									id="date-filter"
									bind:value={dateFilter}
									onchange={() => fetchTrees()}
									class="w-full rounded-md border border-green-200 bg-white p-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
								>
									<option value="all">All Time</option>
									<option value="week">Last Week</option>
									<option value="month">Last Month</option>
									<option value="year">Last Year</option>
								</select>
							</div>

							<div class="space-y-2">
								<label for="height-filter" class="block text-sm font-medium text-green-800"
									>Height</label
								>
								<select
									id="height-filter"
									bind:value={heightFilter}
									onchange={() => fetchTrees()}
									class="w-full rounded-md border border-green-200 bg-white p-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
								>
									<option value="all">All Heights</option>
									<option value="short">Short (&lt; 10m)</option>
									<option value="medium">Medium (10-20m)</option>
									<option value="tall">Tall (&gt; 20m)</option>
								</select>
							</div>

							{#if searchQuery || healthFilter !== 'all' || dateFilter !== 'all' || heightFilter !== 'all'}
								<div class="col-span-full mt-2 flex justify-center">
									<Button
										variant="outline"
										size="sm"
										class="border-green-300 text-green-700 hover:bg-green-50"
										onclick={clearFilters}
									>
										Clear all filters
									</Button>
								</div>
							{/if}
						</div>
					{/if}
				</div>
				<Button class="w-full md:hidden" onclick={toggleSearchUI}>Close</Button>
			</div>
		{/if}
		<main class="flex flex-col">
			<div class="flex flex-col">
				{#if filteredTrees.length === 0}
					<div
						class="flex h-screen flex-col items-center justify-center bg-green-50 p-4 text-center"
					>
						<div class="rounded-lg bg-white p-8 shadow-lg">
							<h2 class="mb-4 text-2xl font-semibold text-gray-800">No trees found</h2>
							<p class="text-gray-600">
								{#if healthFilter !== 'all' || dateFilter !== 'all' || heightFilter !== 'all' || searchQuery}
									No trees match your current filters. Try adjusting your search criteria or
									filters.
								{:else}
									There are no trees in the database yet.
								{/if}
							</p>
							{#if healthFilter !== 'all' || dateFilter !== 'all' || heightFilter !== 'all' || searchQuery}
								<Button
									onclick={clearFilters}
									class="mt-4 bg-green-600 text-white hover:bg-green-700"
								>
									Clear all filters
								</Button>
							{/if}
						</div>
					</div>
				{:else}
					{#each filteredTrees as tree, index}
						<tree id="tree__{index}" class="relative h-screen snap-start bg-green-50">
							<img
								class="h-full w-full object-cover"
								loading="lazy"
								src={isSearching && 'image' in tree ? tree.image : tree.Image}
								alt={isSearching && 'name' in tree ? tree.name : tree.TreeName}
							/>
							<information-container>
								<div
									class="absolute left-0 right-0 top-0 bg-black bg-opacity-50 p-4 text-white backdrop-blur-sm"
								>
									<h1 class="mb-1 text-3xl font-bold">
										{isSearching && 'name' in tree ? tree.name : tree.TreeName}
									</h1>
									<div
										class="location-data mb-2 text-sm font-light"
										use:inview
										oninview_enter={async ({ detail: { inView } }) => {
											const treeId = isSearching && 'id' in tree ? tree.id : tree.Id;
											const treeLat = isSearching && 'lat' in tree ? tree.lat : tree.Lat;
											const treeLng = isSearching && 'lng' in tree ? tree.lng : tree.Lng;

											if (inView && !locations[treeId]) {
												try {
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
										oninview_leave={({ detail: { entry } }) => {
											const top = document
												.getElementById(`tree__${index}`)
												?.getBoundingClientRect().top;
											if (!top) return;
											if (top < window.innerHeight || !signal_ready || index <= 1) return;
											controller.abort();
											controller = new AbortController();
										}}
									>
										{#if locations[isSearching && 'id' in tree ? tree.id : tree.Id]}
											{locations[isSearching && 'id' in tree ? tree.id : tree.Id]}
										{:else}
											📍 Location unavailable
										{/if}
									</div>

									<!-- Tree Health Indicator -->
									<div
										class="tree_health my-4 flex items-center justify-between rounded-md border border-white/20 bg-black/30 px-3 py-2 backdrop-blur-sm"
									>
										<div class="dots flex items-center space-x-2">
											{#each Array(Math.round(getHealthScore(isSearching && 'health' in tree ? tree.health : tree.Health) / 20)) as _, i}
												<span
													class="dot h-4 w-4 rounded-full"
													style="background-color: {`hsl(${i * 30}, 70%, 50%)`}"
												></span>
											{/each}
										</div>
										<p class="w-full pr-2 text-right font-semibold">
											Health: {getHealthStatus(
												getHealthScore(isSearching && 'health' in tree ? tree.health : tree.Health)
											)}
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
												<Dialog.Title
													>{isSearching && 'name' in tree ? tree.name : tree.TreeName} details</Dialog.Title
												>
											</Dialog.Header>
											<div class="grid gap-2 py-2">
												<p>
													Height: <b
														>{isSearching && 'height' in tree
															? tree.height
															: metersToFeet(tree.Height)}</b
													>
												</p>
												<p>Age: <b>{isSearching && 'age' in tree ? tree.age : tree.Age}</b></p>
												<p>
													Health: <b
														>{isSearching && 'health' in tree ? tree.health : tree.Health}</b
													>
												</p>
												{#if (isSearching && 'lat' in tree ? tree.lat : tree.Lat) && (isSearching && 'lng' in tree ? tree.lng : tree.Lng)}
													<p>
														Location: <b
															>{locations[isSearching && 'id' in tree ? tree.id : tree.Id]
																? locations[isSearching && 'id' in tree ? tree.id : tree.Id]
																: '📍 Location unavailable'}</b
														>
													</p>
												{/if}
												<p>
													Planted on: <b
														>{formatDate(
															(isSearching && 'plantedOn' in tree
																? tree.plantedOn
																: tree.PlantedOn) ?? ''
														)}</b
													>
												</p>
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
												{#if isSearching && 'plantedBy' in tree}
													{tree.plantedBy} on {formatDate(tree.plantedOn ?? '')}
												{:else}
													{tree.PlantedBy !== null &&
													!('message' in tree.PlantedBy && 'name' in tree.PlantedBy)
														? `${tree.PlantedBy.FirstName} ${tree.PlantedBy.LastName}`
														: 'Unknown User'} on {formatDate(tree.PlantedOn ?? '')}
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
