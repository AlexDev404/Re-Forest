<script lang="ts">
	import Button from '$lib/components/vendor/ui/button/button.svelte';
	import * as Command from '$lib/components/vendor/ui/command';
	import CommandItem2 from '$lib/components/vendor/ui/command/command-item2.svelte';
	import { Label } from '$lib/components/vendor/ui/label';
	import MenuItem from '$lib/components/vendor/ui/menuitem/menuitem.svelte';
	import type { GeoJSON, ReverseGeoJSON } from '$lib/types/GeoJSON';
	import { getCurrentLocation, getReverseLoc } from '$lib/utility/utility';
	import { Building, House, Locate, Map } from 'lucide-svelte';
	import { onMount } from 'svelte';
	let checked: boolean;
	let cityData: GeoJSON | null = null;

	// ---
	let location: GeolocationCoordinates | (string | null) = null;
	let translated_location: string | null = null;

	onMount(async () => {
		let unitcheck: boolean = JSON.parse(localStorage.getItem('units') ?? 'false');
		if (unitcheck) {
			checked = unitcheck;
			console.log(checked);
		}

		// Set the location
		location = localStorage.getItem('location') ?? null;
		if (location === null) return;
		location = JSON.parse(location);
		if (location === null) return;
		const reverse_location: ReverseGeoJSON | null = await getReverseLoc(
			(location as GeolocationCoordinates).latitude,
			(location as GeolocationCoordinates).longitude
		);
		if (reverse_location === null) return;
		translated_location = reverse_location.display_name;
	});

	let backoff = 500;
	let timeout: ReturnType<typeof setTimeout>;

	// Get the current location
	async function queryLocations(location: string): Promise<GeoJSON> {
		const response = await fetch(`https://photon.komoot.io/api/?q=${location}&limit=5`);
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		cityData = data;
		cityData = cityData;
		return data;
	}

	// Get the reverse location
	async function getReverseLoc_(lat: number, lng: number): Promise<ReverseGeoJSON> {
		const result: ReverseGeoJSON | null = await getReverseLoc(lat, lng);
		if (result === null) {
			translated_location = 'Try that again.';
			throw new Error('Location not found.');
		}
		return result;
	}
</script>

<svelte:head>
	<title>Re:Forest :: Settings ::&gt; Site Location</title>
</svelte:head>
<page class="overflow-y-auto">
	<main class="mx-6 my-10 flex min-h-[80vh] flex-col items-start gap-9">
		<div class="flex flex-col items-start self-stretch">
			<h1 class="text-2xl font-semibold">
				<a href="/configure">Settings</a> <span> &gt; Site Location</span>
			</h1>
			<br />
			<div class="flex w-full flex-col items-start space-y-14">
				<div class="flex w-full flex-col items-center space-y-4">
					<div class="w-full rounded-sm border border-slate-100 px-2 pb-2">
						<MenuItem title="Site Location" class="border-0 px-0">
							<svelte:fragment slot="start-icon">
								<Map class="h-4 w-4" />
							</svelte:fragment>
						</MenuItem>
						<p class="text-xs font-light">
							Currently set to: <b>{translated_location ?? 'Set a default location.'}</b>
						</p>
					</div>
					<Button
						class="w-full"
						onclick={async () => {
							const loc: GeolocationCoordinates | null = await getCurrentLocation();
							console.log(loc);
							if (loc !== null) {
								const reverse_location: ReverseGeoJSON = await getReverseLoc_(
									loc.latitude,
									loc.longitude
								);
								translated_location = reverse_location.display_name;

								localStorage.setItem('location', JSON.stringify(loc));
							}
						}}>Grab my current location</Button
					>
				</div>
				<div class="grid w-full items-center gap-1.5">
					<Label for="location">Custom Location</Label>
					<Command.Root class="w-full rounded-lg border">
						<Command.Input
							class="w-full"
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									const target = e.target as HTMLInputElement;
									clearTimeout(timeout);
									timeout = setTimeout(async () => {
										await queryLocations(target.value);
										console.log(cityData);
									}, backoff);
								}
							}}
							oninput={async (e: Event) => {
								const target = e.target as HTMLInputElement;
								if (target === null || target.value === '') {
									console.log('target is null');
									cityData = null;
									return;
								}
								console.log(target.value);
								clearTimeout(timeout);
								timeout = setTimeout(async () => {
									await queryLocations(target.value);
									console.log(cityData);
								}, backoff);
							}}
							placeholder="Type a command or search..."
						/>

						{#if cityData}
							{#if cityData && cityData.features.length > 0}
								<!-- Search results -->
								<Command.List title="Search results">
									{#each cityData.features as city}
										<!-- {city.properties.name} -->
										<CommandItem2
											onclick={async () => {
												const lat = city.geometry.coordinates[1];
												const lng = city.geometry.coordinates[0];
												const reverse_location: ReverseGeoJSON = await getReverseLoc(lat, lng);
												translated_location = reverse_location.display_name;
												localStorage.setItem(
													'location',
													JSON.stringify({ latitude: lat, longitude: lng })
												);
											}}
											data-lat={city.geometry.coordinates[1]}
											data-lng={city.geometry.coordinates[0]}
										>
											{#if city.properties.type === 'other'}
												<Map class="mr-2 h-4 w-4" />
											{:else if city.properties.type === 'state'}
												<Locate class="mr-2 h-4 w-4" />
											{:else if city.properties.type === 'country'}
												<Map class="mr-2 h-4 w-4" />
											{:else if city.properties.type === 'county'}
												<House class="mr-2 h-4 w-4" />
											{:else if city.properties.type === 'city' || city.properties.type === 'district'}
												<Building class="mr-2 h-4 w-4" />
											{/if}
											<div>
												<div>{@html city.properties.name.replace(/"/g, '&quot;')}</div>
												<div class="text-xs font-light">
													{@html city.properties.country.replace(/"/g, '&quot;')}
												</div>
											</div>
											<Command.Shortcut
												>{@html (
													(city.properties.type ?? '').charAt(0).toUpperCase() +
													(city.properties.type ?? '').slice(1).toLowerCase()
												)
													.toString()
													.replace(/"/g, '&quot;')}</Command.Shortcut
											>
										</CommandItem2>
									{/each}
								</Command.List>
							{:else}
								<Command.Empty>No results found.</Command.Empty>
							{/if}
						{/if}
					</Command.Root>
				</div>
			</div>
		</div>
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
