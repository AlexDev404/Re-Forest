<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/vendor/ui/button';
	import IconCard from '$lib/components/vendor/ui/icon-card/icon-card.svelte';
	import { type ReverseGeoJSON } from '$lib/types/GeoJSON';
	import type { Tree } from '$lib/types/Tree';
	import { getReverseLoc } from '$lib/utility/utility';
	import { onMount } from 'svelte';

	let submittedTree: Tree = {
		name: '',
		health: Math.floor(Math.random() * 100 + 1) + '%',
		plantedBy: 'Anonymous',
		plantedOn: new Date().toISOString().split('T')[0],
		image: undefined,
		height: undefined,
		age: Math.floor(Math.random() * 100 + 1) + ' years',
		lat: 0,
		lng: 0
	};

	let treeImageSrc: string | null = null;

	// Location handling
	let tree_added = false;

	// ---
	let location: GeolocationCoordinates | (string | null) = null;
	let translated_location: string | null = null;

	onMount(async () => {
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

	function openMapPicker() {
		// console.log('Trying to open map picker...');
		goto('/configure/site-location');
	}

	// Photo handling
	let fileInput: HTMLInputElement;

	function handlePhotoClick() {
		fileInput?.click();
	}

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			const formData = new FormData();
			formData.append('file', file);

			try {
				const response = await fetch('/api/upload', {
					method: 'POST',
					body: formData
				});
				const data = await response.json();
				if (response.ok) {
					const imageUrl = data.url;
					submittedTree.image = imageUrl;
					treeImageSrc = imageUrl;
				} else {
					console.error('Upload failed:', data);
				}
			} catch (error) {
				console.error('Error uploading file:', error);
			}
		}
	}
</script>

<svelte:head>
	<title>Re:Forest :: Manage Trees</title>
</svelte:head>
<page class="block h-fit overflow-y-auto pb-20">
	<main class="mx-6 my-10 flex flex-col items-start gap-12">
		<article class="flex items-start self-stretch">
			<div class="flex w-full items-center justify-between">
				<h1 class="text-2xl font-semibold">Manage Trees</h1>
				<a href="/add/manage"><Button>Add Tree</Button></a>
			</div>
		</article>
		<IconCard
			avatarSrc="/static/edit.svg"
			avatarFallback="✏️"
			title="Tree Name"
			description={`Planted by: Someone`}
		>
			<svelte:fragment slot="content">
				<Button variant="destructive">Delete</Button>
			</svelte:fragment>
		</IconCard>
	</main>
</page>

<input
	type="file"
	accept="image/jpeg,image/png,image/webp"
	bind:this={fileInput}
	on:change={handleFileSelect}
	class="hidden"
/>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
