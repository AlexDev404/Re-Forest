<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/vendor/ui/button';
	import IconCard from '$lib/components/vendor/ui/icon-card/icon-card.svelte';
	import { Input } from '$lib/components/vendor/ui/input';
	import { Label } from '$lib/components/vendor/ui/label';
	import { type ReverseGeoJSON } from '$lib/types/GeoJSON';
	import { getReverseLoc } from '$lib/utility/utility';
	import { onMount } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';

	const data: PageData = $props();
	const { form, errors, constraints, enhance } = superForm(data.form?.super_form ?? data.data);
	let treeImageSrc: string | null = $state(null);

	// Location handling
	let tree_added = false;
	let location: GeolocationCoordinates | (string | null) = null;
	let translated_location: string | null = null;

	onMount(async () => {
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
	let uploading = false;

	function handlePhotoClick() {
		fileInput?.click();
	}

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			const formData = new FormData();
			formData.append('file', file);

			uploading = true;

			try {
				const response = await fetch('/api/upload', {
					method: 'POST',
					body: formData
				});
				const data = await response.json();
				if (response.ok) {
					const imageUrl = data.url;
					$form.image = imageUrl;
					treeImageSrc = imageUrl;
				} else {
					console.error('Upload failed:', data);
					// Optionally show error to user
				}
			} catch (error) {
				console.error('Error uploading file:', error);
				// Optionally show error to user
			} finally {
				uploading = false;
			}
		}
	}
</script>

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
				<Button class="w-full" on:click={handlePhotoClick} disabled={uploading}>
					{uploading ? 'Uploading...' : 'Select from your gallery'}
				</Button>
			</svelte:fragment>
		</IconCard>

		<form method="POST" class="flex w-full flex-col gap-8 lg:px-12" use:enhance>
			<input type="hidden" name="tree_lat" value={location?.latitude} />
			<input type="hidden" name="tree_lng" value={location?.longitude} />
			<input type="hidden" name="tree_image" value={treeImageSrc} />

			<div class="grid w-full items-center gap-1.5">
				<Label for="tree_name" class="w-fit">Tree Name</Label>
				<Input
					type="text"
					name="tree_name"
					id="tree_name"
					placeholder="Enter a tree name"
					bind:value={$form.tree_name}
					class="w-full"
					required
				/>
				{#if $errors.tree_name}
					<p class="text-sm text-red-500">{$errors.tree_name}</p>
				{/if}
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="tree_height" class="w-fit">Height (in meters)</Label>
				<Input
					type="number"
					name="tree_height"
					id="tree_height"
					placeholder="Enter the tree height"
					bind:value={$form.tree_height}
					class="w-full"
					min="0"
					step="0.01"
					required
				/>
				{#if $errors.tree_height}
					<p class="text-sm text-red-500">{$errors.tree_height}</p>
				{/if}
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="tree_age" class="w-fit">Age (in years)</Label>
				<Input
					type="number"
					name="tree_age"
					id="tree_age"
					bind:value={$form.tree_age}
					placeholder="Enter the tree age"
					class="w-full"
					min="0"
					required
				/>
				{#if $errors.tree_age}
					<p class="text-sm text-red-500">{$errors.tree_age}</p>
				{/if}
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="tree_species" class="w-fit">Species</Label>
				<Input
					type="text"
					name="tree_species"
					id="tree_species"
					bind:value={$form.tree_species}
					placeholder="Enter the tree species"
					class="w-full"
					required
				/>
				{#if $errors.tree_species}
					<p class="text-sm text-red-500">{$errors.tree_species}</p>
				{/if}
			</div>
			<p class="text-sm text-destructive">{$errors._errors}</p>

			<a href="/configure/site-location">
				<Button
					class="w-full border border-primary bg-transparent text-primary hover:bg-transparent hover:opacity-80"
				>
					Set site location
				</Button>
			</a>

			<Button type="submit" class="w-full">Submit</Button>
		</form>
	</main>
</page>

<input
	type="file"
	accept="image/jpeg,image/png,image/webp"
	bind:this={fileInput}
	onchange={handleFileSelect}
	class="hidden"
/>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
