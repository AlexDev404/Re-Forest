<script lang="ts">
	// Mapbox imports temporarily disabled
	// import { formatDate, metersToFeet } from '$lib/utility/utility';
	// import { Map, Marker, controls } from '@beyonk/svelte-mapbox';
	// import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	// Get tree data from server-side load function
	const { data }: PageProps = $props();
	// let trees = data.trees;

	// const { GeolocateControl, NavigationControl, ScaleControl } = controls;
	// let mapComponent;

	// onMount(() => {
	// 	// Belmopan/Belize: 17.15040"N 88.46040"W
	// 	// Usage of methods like setCenter and flyto
	// 	mapComponent.setCenter([-88.768579, 17.25118]); // zoom is optional
	// 	mapComponent.setZoom(10.5);
	// 	mapComponent.flyTo({ center: [-88.768579, 17.25118] }); // documentation (https://docs.mapbox.com/mapbox-gl-js/example/flyto)
	// });

	// Define this to handle `eventname` events - see [GeoLocate Events](https://docs.mapbox.com/mapbox-gl-js/api/markers/#geolocatecontrol-events)
	// function eventHandler(e: CustomEvent) {
	// 	const data = e.detail;
	// 	// do something with `data`, it's the result returned from the mapbox event
	// }

	// Helper function to convert health status to display class
	// function getHealthClass(health: string): string {
	// 	health = health.toUpperCase();
	// 	if (health === 'EXCELLENT' || health === 'GOOD') return 'text-green-600';
	// 	if (health === 'FAIR') return 'text-orange-600';
	// 	return 'text-red-600';
	// }

	// Helper function to get display text for health status
	// function getHealthDisplay(health: string): string {
	// 	health = health.toUpperCase();
	// 	if (health === 'EXCELLENT' || health === 'GOOD') return 'Good';
	// 	if (health === 'FAIR') return 'Fair';
	// 	return 'Poor';
	// }
</script>

<svelte:head>
	<title>Re:Forest :: Home</title>
</svelte:head>
<page>
	<!-- Mapbox integration temporarily disabled as per requirements -->
	<div class="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
		<div class="text-center px-4">
			<h1 class="text-3xl font-bold text-foreground mb-4">Re:Forest</h1>
			<p class="text-muted-foreground mb-6">Tree Planting Tracking Application</p>
			<p class="text-sm text-muted-foreground mb-8">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.
			</p>
			<div class="flex gap-4 justify-center flex-wrap">
				<a href="/manage/add" class="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M12 2v20M2 12h20"/></svg>
					Add Tree Planting
				</a>
				<a href="/explore" class="inline-flex items-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
					Explore Trees
				</a>
			</div>
		</div>
	</div>
	<!-- Original Mapbox code commented out
	<Map
		class="mapboxgl-map"
		style="mapbox://styles/alexdev404/cm3fahi7e001x01qx5hh59f8z"
		accessToken="pk.eyJ1IjoiYWxleGRldjQwNCIsImEiOiJjbTNmYTc2dzMwbzB5MmxvaWJiNW41YnJkIn0.RqSQj43w3k4Da7y4IFgbuA"
		bind:this={mapComponent}
		options={{ scrollZoom: true }}
	>
		{#each trees as tree}
			<Marker
				lat={tree.Lat}
				lng={tree.Lng}
				label="Tree Marker"
				popupClassName="bg-transparent text-lg"
			>
				<div class="content text-black" slot="popup">
					<h3 class="font-semibold">{tree.TreeName}</h3>
					<p class="text-sm font-light">This is a pin with the following information:</p>
					<p class="text-sm font-light">
						Overall Tree Health:
						<span class="font-bold {getHealthClass(tree.Health)}">
							{getHealthDisplay(tree.Health)}
						</span>
					</p>
					<p class="text-sm font-light">Height: {metersToFeet(tree.Height)}</p>
					<p class="text-sm font-light">Age: {tree.Age} years</p>
					<p class="text-sm font-light">
						Planted by: {tree.PlantedBy
							? `${tree.PlantedBy.FirstName} ${tree.PlantedBy.LastName}`
							: 'Unknown'}
					</p>
					<p class="text-sm font-light">Planted on: {formatDate(tree.PlantedOn ?? '')}</p>
				</div>
			</Marker>
		{/each}

		<NavigationControl />
		<GeolocateControl options={{ some: 'control-option' }} on:eventname={eventHandler} />
	</Map>
	-->
</page>

<style>
	:global(.mapboxgl-canvas-container, .mapboxgl-map, .mapboxgl-canvas) {
		height: 100vh;
	}

	:global(.class-name) {
		background-color: #000;
		color: #fff;
	}

	:global(.mapboxgl-marker) {
		cursor: pointer;
	}
</style>
