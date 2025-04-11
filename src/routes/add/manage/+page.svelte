<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/vendor/ui/button';
	import IconCard from '$lib/components/vendor/ui/icon-card/icon-card.svelte';
	import { Input } from '$lib/components/vendor/ui/input';
	import { Label } from '$lib/components/vendor/ui/label';
	import { type ReverseGeoJSON } from '$lib/types/GeoJSON';
	import type { Tree } from '$lib/types/Tree';
	import { getReverseLoc } from '$lib/utility/utility';
	import { onMount } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
    
    const data: PageData = $props();
    const { form, errors, constraints, enhance } = superForm(data.form?.super_form ?? data.data);

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
<!-- <SuperDebug -->
<svelte:head>
	<title>Re:Forest :: Manage Trees &gt; Add Tree</title>
</svelte:head>
<page class="block h-fit overflow-y-auto pb-20">
	<main class="mx-6 my-10 flex flex-col items-start gap-12">
		<article class="flex items-start self-stretch">
			<div class="flex w-full items-center justify-between">
				<h1 class="text-2xl font-semibold"><a href="/add">Manage Trees</a> &gt; Add Tree</h1>
			</div>
		</article>

		<IconCard
			wants_image
			srcImgAlt="Tree image"
			srcImg={treeImageSrc}
			srcImagePlaceholderText="No image available.<br/>Insert one above.<br/>(you can't click here)"
			avatarFallback="📸"
			title={'Click to add a photo'}
			description={'Add a photo to represent the tree'}
		>
			<svelte:fragment slot="content1">
				<Button class="w-full" onclick={handlePhotoClick}>Select from your gallery</Button>
			</svelte:fragment>
		</IconCard>

		<form method="POST" action="?/createTree" class="flex w-full flex-col gap-8 lg:px-12"	use:enhance>
			<input type="hidden" name="tree_lat" value={location?.latitude} />
			<input type="hidden" name="tree_lng" value={location?.longitude} />
            <input type="hidden" name="tree_image" value={treeImageSrc}/>
			<div class="grid w-full items-center gap-1.5">
                <Label for="tree_name" class="w-fit">Tree Name</Label>
				<Input
                type="text"
                name="tree_name"
                id="tree_name"
                placeholder="Enter a tree name"
                class="w-full"
				/>
			</div>
			<div class="grid w-full items-center gap-1.5">
				<Label for="tree_height" class="w-fit">Height</Label>
				<Input
					type="text"
					name="tree_height"
					id="treeHeight"
					placeholder="Enter the tree height"
					class="w-full"
				/>
			</div>
			<div class="grid w-full items-center gap-1.5">
                <Label for="treeAge" class="w-fit">Age</Label>
				<Input
                type="number"
                name="tree_age"
                min="0"
					id="treeAge"
					placeholder="Enter the tree age"
					class="w-full"
                    />
                </div>
			<div class="grid w-full items-center gap-1.5">
				<Label for="treeSpecies" class="w-fit">Species</Label>
				<Input
					type="text"
					name="tree_species"
					id="treeSpecies"
					placeholder="Enter the tree species"
					class="w-full"
                    />
                </div>
                <a href="/configure/site-location"
				><Button
                class="w-full border border-primary bg-transparent text-primary hover:bg-transparent hover:opacity-80"
                >Set site location</Button
				></a
                >
                <Button type="submit" class="w-full">Submit</Button>
            </form>
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
