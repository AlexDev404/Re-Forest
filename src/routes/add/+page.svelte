<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Alert from '$lib/components/vendor/ui/alert';
	import { Button } from '$lib/components/vendor/ui/button';
	import IconCard from '$lib/components/vendor/ui/icon-card/icon-card.svelte';
	import { Input } from '$lib/components/vendor/ui/input';
	import { Label } from '$lib/components/vendor/ui/label';
	import { type ReverseGeoJSON } from '$lib/types/GeoJSON';
	import { getCurrentLocation, getReverseLoc } from '$lib/utility/utility';
	import { MapPin, Zap } from 'lucide-svelte';
	import { onMount } from 'svelte';

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

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			// Handle the selected file
			const file = target.files[0];
			// Add your file handling logic here
			console.log('Selected file:', file);
		}
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
	<title>Re:Forest :: Add</title>
</svelte:head>
<page class="overflow-y-auto">
	<main class="mx-6 my-10 flex flex-col items-start gap-12">
		<article class="flex items-start self-stretch">
			<div class="block w-full space-y-1">
				<h1 class="text-2xl font-semibold">New Tree</h1>
				<Button
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
				<Button on:click={openMapPicker}>Set site location</Button>
			</div>
		</article>
		<IconCard
			avatarSrc="/static/camera.svg"
			avatarFallback="📸"
			title={'Click to add a photo'}
			description={'Add a photo to represent the tree'}
			on:click={handlePhotoClick}
		>
			<svelte:fragment slot="content1">
				<Button class="w-full" on:click={handlePhotoClick}>Or select from your gallery</Button>
			</svelte:fragment>
		</IconCard>
		<IconCard
			avatarSrc="null"
			avatarFallback="✏️"
			title={'Create a new tree'}
			description={'Provide details about the new tree you want to add.'}
			dialog_title="Create a new tree"
			dialog_description="Fill in the details below to create a new tree"
			wants_dialog
		>
			<svelte:fragment slot="dialog-trigger">
				<Button class="w-full">Add a tree</Button>
			</svelte:fragment>
			<svelte:fragment slot="dialog-content">
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="tree-name" class="text-right">Name</Label>
						<Input id="tree-name" placeholder="Beech tree" class="col-span-3 border-slate-800 text-background" />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="tree-label" class="text-right">Label</Label>
						<Input id="tree-label" placeholder="This tree is..." class="col-span-3 border-slate-800" />
					</div>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="dialog-footer">
				<Button
					type="submit"
					class="w-full"
					on:click={() => {
						document.querySelector('[data-melt-dialog-overlay]')?.remove();
						document.getElementById('add-tree')?.remove();
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
			<Alert.Title>Your set location.</Alert.Title>
			<Alert.Description
				>{#if translated_location !== null}
					{translated_location}
				{:else}
					<div>Set a default location</div><a class="underline" href="/configure/site-location"> in settings.</a>
				{/if}
			</Alert.Description>
		</Alert.Root>
	</main>
</page>

<input
	type="file"
	accept="image/*"
	bind:this={fileInput}
	on:change={handleFileSelect}
	class="hidden"
/>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
