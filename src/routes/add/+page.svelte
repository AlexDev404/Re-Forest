<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Alert from '$lib/components/vendor/ui/alert';
	import { Button } from '$lib/components/vendor/ui/button';
	import ButtonAlt from '$lib/components/vendor/ui/button/button-span.svelte';
	import IconCard from '$lib/components/vendor/ui/icon-card/icon-card.svelte';
	import { Input } from '$lib/components/vendor/ui/input';
	import { Label } from '$lib/components/vendor/ui/label';
	import TreeData from '$lib/data/trees.json';
	import { type ReverseGeoJSON } from '$lib/types/GeoJSON';
	import type { Tree } from '$lib/types/Tree';
	import { getReverseLoc } from '$lib/utility/utility';
	import { MapPin, Zap } from 'lucide-svelte';
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
					console.log('Image URL:', imageUrl);
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
	<title>Re:Forest :: Add</title>
</svelte:head>
<page class="block h-fit overflow-y-auto pb-20">
	<main class="mx-6 my-10 flex flex-col items-start gap-12">
		<article class="flex items-start self-stretch">
			<div class="block w-full space-y-1">
				<h1 class="text-2xl font-semibold">New Tree</h1>
				<Button class="w-full" on:click={openMapPicker}>Set a location</Button>
			</div>
		</article>
		<IconCard
			wants_image
			srcImgAlt="Tree image"
			srcImg={treeImageSrc}
			avatarSrc="/static/camera.svg"
			srcImagePlaceholderText="No image available.<br/>Insert one above.<br/>(you can't click here)"
			avatarFallback="📸"
			title={'Click to add a photo'}
			description={'Add a photo to represent the tree'}
		>
			<svelte:fragment slot="content1">
				<Button class="w-full" on:click={handlePhotoClick}>Or select from your gallery</Button>
			</svelte:fragment>
		</IconCard>
		<IconCard
			avatarSrc="null"
			avatarFallback="✏️"
			title={'Now, provide some details...'}
			description={'Provide details about the new tree you want to add.'}
			dialog_title="Create a new tree"
			dialog_description="Fill in the details below to create a new tree"
			wants_dialog
		>
			<svelte:fragment slot="dialog-trigger">
				<ButtonAlt>Add Tree</ButtonAlt>
			</svelte:fragment>
			<svelte:fragment slot="dialog-content">
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="tree-name" class="text-right">Name</Label>
						<Input
							bind:value={submittedTree.name}
							id="tree-name"
							placeholder="Beech tree"
							class="col-span-3 border-slate-800"
						/>
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="tree-height" class="text-right">Height</Label>
						<Input
							bind:value={submittedTree.height}
							id="tree-height"
							type="number"
							placeholder="Units are in meters"
							class="col-span-3 border-slate-800"
						/>
					</div>
					<p class="text-xs font-light text-red-500" hidden={treeImageSrc !== null}>
						Image missing. Please go back and insert one.
					</p>
					<p class="text-xs font-light text-red-500" hidden={location !== null}>
						You haven't set a location. Please go back and set one.
					</p>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="dialog-footer">
				<Button
					type="submit"
					disabled={treeImageSrc === null || location === null}
					class="w-full"
					on:click={() => {
						document.querySelector('[data-melt-dialog-overlay]')?.remove();
						document.getElementById('add-tree')?.remove();
						submittedTree.lat = (location as GeolocationCoordinates).latitude;
						submittedTree.lng = (location as GeolocationCoordinates).longitude;
						localStorage.setItem('trees', JSON.stringify([submittedTree, ...TreeData]));
						tree_added = true;
					}}>Add this tree</Button
				>
			</svelte:fragment>
		</IconCard>
		{#if tree_added}
			<Alert.Root>
				<Zap />
				<Alert.Title>Your tree was added.</Alert.Title>
				<Alert.Description>Go over to the view screen to see it live!</Alert.Description>
			</Alert.Root>
		{/if}

		<Alert.Root>
			<MapPin />
			<Alert.Title>Your location.</Alert.Title>
			<Alert.Description
				>{#if translated_location !== null}
					{translated_location}
				{:else}
					<div>Set a default location</div>
					<a class="underline" href="/configure/site-location"> in settings.</a>
				{/if}
			</Alert.Description>
		</Alert.Root>
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
