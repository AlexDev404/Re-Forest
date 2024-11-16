<script lang="ts">
	import treesData from '$lib/data/trees.json';
	import { type Tree } from '$lib/types/Tree';
	import { Map, Marker, controls } from '@beyonk/svelte-mapbox';
	import { onMount } from 'svelte';
	// custom component

	const { GeolocateControl, NavigationControl, ScaleControl } = controls;
	let mapComponent;

	onMount(() => {
		// Belmopan/Belize: 17.15040"N 88.46040"W
		// Usage of methods like setCenter and flyto
		mapComponent.setCenter([-88.768579, 17.25118]); // zoom is optional
		mapComponent.setZoom(10.5);
		mapComponent.flyTo({ center: [-88.768579, 17.25118] }); // documentation (https://docs.mapbox.com/mapbox-gl-js/example/flyto)

		// trees.forEach((tree) => {
		// 	const distance = Math.random() * (15 - 1) + 1; // Random distance between 1 and 15 miles
		// 	const angle = Math.random() * 360; // Random angle in degrees
		// 	const { newLat, newLng } = calculateNewCoordinates(originalLat, originalLng, distance, angle);
		// 	tree.lat = newLat;
		// 	tree.lng = newLng;
		// });
	});
	// Define this to handle `eventname` events - see [GeoLocate Events](https://docs.mapbox.com/mapbox-gl-js/api/markers/#geolocatecontrol-events)
	function eventHandler(e: CustomEvent) {
		const data = e.detail;
		// do something with `data`, it's the result returned from the mapbox event
	}

	// Tree information data
	// Original coordinates for the main marker
	// const originalLat = 17.25118;
	// const originalLng = -88.768579;

	// Distance between two points formula
	// function calculateNewCoordinates(
	// 	lat: number,
	// 	lng: number,
	// 	distanceInMiles: number,
	// 	angleInDegrees: number
	// ) {
	// 	const earthRadius = 3958.8; // Radius of Earth in miles
	// 	const angleInRadians = angleInDegrees * (Math.PI / 180);

	// 	const newLat =
	// 		Math.asin(
	// 			Math.sin(lat * (Math.PI / 180)) * Math.cos(distanceInMiles / earthRadius) +
	// 				Math.cos(lat * (Math.PI / 180)) *
	// 					Math.sin(distanceInMiles / earthRadius) *
	// 					Math.cos(angleInRadians)
	// 		) *
	// 		(180 / Math.PI);

	// 	const newLng =
	// 		lng +
	// 		Math.atan2(
	// 			Math.sin(angleInRadians) *
	// 				Math.sin(distanceInMiles / earthRadius) *
	// 				Math.cos(lat * (Math.PI / 180)),
	// 			Math.cos(distanceInMiles / earthRadius) -
	// 				Math.sin(lat * (Math.PI / 180)) * Math.sin(newLat * (Math.PI / 180))
	// 		) *
	// 			(180 / Math.PI);

	// 	return { newLat, newLng };
	// }

	// List of trees with original data, and we'll generate coordinates onMount
	const trees: Tree[] = treesData;
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
				lat={tree.lat}
				lng={tree.lng}
				label="Tree Marker"
				popupClassName="bg-transparent text-lg"
			>
				<div class="content text-black" slot="popup">
					<h3 class="font-semibold">{tree.name}</h3>
					<p class="text-sm font-light">This is a pin with the following information:</p>
					<p class="text-sm font-light">
						Overall Tree Health:
						{#if parseInt(tree.health.replace(/[^0-9]/g, '')) > 80}
							<span class="font-bold text-green-600">Good</span>
						{:else if parseInt(tree.health.replace(/[^0-9]/g, '')) > 70}
							<span class="font-bold text-orange-600">Fair</span>
						{:else}
							<span class="font-bold text-red-600">Poor</span>
						{/if}
					</p>
					<p class="text-sm font-light">Planted by: {tree.plantedBy}</p>
					<p class="text-sm font-light">Planted on: {tree.plantedOn}</p>
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
