<script lang="ts">
	import { formatDate, metersToFeet } from '$lib/utility/utility';
	import { Map, Marker, controls } from '@beyonk/svelte-mapbox';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	// Get tree data from server-side load function
	const { data }: PageProps = $props();
	let trees = data.trees;

	const { GeolocateControl, NavigationControl, ScaleControl } = controls;
	let mapComponent;

	onMount(() => {
		// Belmopan/Belize: 17.15040"N 88.46040"W
		// Usage of methods like setCenter and flyto
		mapComponent.setCenter([-88.768579, 17.25118]); // zoom is optional
		mapComponent.setZoom(10.5);
		mapComponent.flyTo({ center: [-88.768579, 17.25118] }); // documentation (https://docs.mapbox.com/mapbox-gl-js/example/flyto)
	});

	// Define this to handle `eventname` events - see [GeoLocate Events](https://docs.mapbox.com/mapbox-gl-js/api/markers/#geolocatecontrol-events)
	function eventHandler(e: CustomEvent) {
		const data = e.detail;
		// do something with `data`, it's the result returned from the mapbox event
	}

	// Helper function to convert health status to display class
	function getHealthClass(health: string): string {
		health = health.toUpperCase();
		if (health === 'EXCELLENT' || health === 'GOOD') return 'text-green-600';
		if (health === 'FAIR') return 'text-orange-600';
		return 'text-red-600';
	}

	// Helper function to get display text for health status
	function getHealthDisplay(health: string): string {
		health = health.toUpperCase();
		if (health === 'EXCELLENT' || health === 'GOOD') return 'Good';
		if (health === 'FAIR') return 'Fair';
		return 'Poor';
	}
</script>

<svelte:head>
	<title>Re:Forest :: Home</title>
</svelte:head>
<page>
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
		<!-- <ScaleControl /> -->
	</Map>
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
