<script lang="ts">
	import * as Alert from '$lib/components/vendor/ui/alert';
	import * as Dialog from '$lib/components/vendor/ui/dialog';
	import TreeData from '$lib/data/trees.json';
	import { type Tree } from '$lib/types/Tree';
	import { BadgePlus } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { inview } from 'svelte-inview';
	let trees: Tree[] = TreeData;
	let locationElement: HTMLDivElement;
	let data: any;
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

	onMount(() => {
		console.log(trees);
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
							src={tree.image}
							alt={tree.name}
						/>
						<information-container>
							<div class="absolute left-0 right-0 top-0 bg-black bg-opacity-50 p-4 text-white">
								<h1 class="mb-1 text-3xl font-bold">{tree.name}</h1>
								<p>{tree.description}</p>
								<div>
									<!-- <p>Location: {tree.lat} {tree.lng}</p> -->
									<div
										class="location-data mb-2 text-sm font-light"
										use:inview
										on:inview_enter={(isVisible) => {
											if (isVisible && !tree.location_readable) {
												// Do something when the div is visible
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
												// console.log('This div is currently in view');
											}
										}}
										on:inview_leave={(event) => {
											console.log(index);
											// Check one more time to see if the element is still in view
											if (
												document.getElementById(`tree__${index}`)?.getBoundingClientRect().top <
												window.innerHeight
											) {
												// console.log('Still in view');
												return;
											}
											if (
												(event.scrollDirection =
													('down' && index === 1) || index === 0 || !signal_ready || !index)
											) {
												return;
											}
											// Do something when the div is not visible
											controller.abort();
											// Create a new controller
											controller = new AbortController(); // Weird lol
											console.log(event, 'This div is not in view');
										}}
										bind:this={locationElement}
									>
										{#if tree}
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
										{#each Array(Math.round(parseInt(tree.health.replace(/[^0-9]/g, '')) / 20)) as _, i}
											<span
												class="dot h-4 w-4 rounded-full"
												style="background-color: {`hsl(${i * 30}, 70%, 50%)`}"
											/>
										{/each}
									</div>
									<p class="w-full pr-2 text-right font-semibold">
										{#snippet healthStatus()}
											{@const healthScore =
												Math.round(parseInt(tree.health.replace(/[^0-9]/g, '')) / 20) * 30}
											<!-- {healthScore} -->
											{#if healthScore < 90}
												Poor
											{:else if healthScore <= 90}
												Fair
											{:else if healthScore <= 120}
												Good
											{:else if healthScore > 120}
												Excellent
											{:else}
												{healthScore}
											{/if}
										{/snippet}

										{@render healthStatus()}
									</p>
								</div>
								<Dialog.Root>
									<Dialog.Trigger class="font-light underline">More details</Dialog.Trigger>

									<Dialog.Content class="max-w-[250px] rounded-lg" id="add-tree">
										<Dialog.Header>
											<Dialog.Title>Tree details</Dialog.Title>
										</Dialog.Header>
										<div class="text-md">
											<p>Height: <b>{metersToFeet(JSON.parse(tree.height ?? '0'))}</b></p>
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
			</div>
		</main>
	</div>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
