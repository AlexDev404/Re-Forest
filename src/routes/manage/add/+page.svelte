<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/vendor/ui/button';
	import Button2 from '$lib/components/vendor/ui/button/button.svelte';
	import * as Command from '$lib/components/vendor/ui/command';
	import CommandItem2 from '$lib/components/vendor/ui/command/command-item2.svelte';
	import IconCard from '$lib/components/vendor/ui/icon-card/icon-card.svelte';
	import { Input } from '$lib/components/vendor/ui/input';
	import { Label } from '$lib/components/vendor/ui/label';
	import { type ReverseGeoJSON } from '$lib/types/GeoJSON';
	import { getReverseLoc } from '$lib/utility/utility';
	import { Leaf } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const { form, errors, constraints, enhance } = superForm(data.form);
	let treeImageSrc: string | null = $state(null);
	let speciesData = $state<{ id: number; name: string }[] | null>(null);
	let selectedSpeciesName = $state<string | null>(null);

	// Location handling
	let tree_added = false;
	let location: GeolocationCoordinates | (string | null) = $state(null);
	let translated_location: string | null = null;
	let timeout: ReturnType<typeof setTimeout>;
	let backoff = 500;

	// Function to fetch tree species
	async function querySpecies(query: string = ''): Promise<void> {
		try {
			const response = await fetch(`/api/tree-species?q=${query}&limit=10`);
			if (!response.ok) {
				throw new Error('Failed to fetch species data');
			}
			const data = await response.json();
			speciesData = data.species;
		} catch (error) {
			console.error('Error fetching species:', error);
			speciesData = null;
		}
	}

	onMount(async () => {
		// Fetch initial species list
		await querySpecies();

		// Get location data
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
	let uploading = $state(false);

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
					$form.tree_image = imageUrl;
					treeImageSrc = imageUrl;
				} else {
					// Optionally show error to user
					console.error('Upload failed:', data);
				}
			} catch (error) {
				// Optionally show error to user
				console.error('Error uploading file:', error);
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
				<Button class="w-full" onclick={handlePhotoClick} disabled={uploading}>
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
				<input
					type="hidden"
					name="tree_species"
					id="tree_species"
					bind:value={$form.tree_species}
				/>

				{#if selectedSpeciesName}
					<div class="mb-2 flex items-center justify-between rounded-lg border p-3">
						<div class="flex items-center gap-2">
							<Leaf class="h-4 w-4" />
							<span>{selectedSpeciesName}</span>
						</div>
						<Button2
							variant="ghost"
							size="sm"
							class="h-8 px-2 lg:px-3"
							onclick={() => {
								selectedSpeciesName = null;
								$form.tree_species = '';
							}}
						>
							Change
						</Button2>
					</div>
				{/if}

				{#if !selectedSpeciesName}
					<Command.Root class="w-full rounded-lg border">
						<Command.Input
							class="w-full"
							placeholder="Search for a tree species..."
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									const target = e.target as HTMLInputElement;
									clearTimeout(timeout);
									timeout = setTimeout(async () => {
										await querySpecies(target.value);
									}, backoff);
								}
							}}
							oninput={async (e: Event) => {
								const target = e.target as HTMLInputElement;
								if (target === null || target.value === '') {
									await querySpecies('');
									return;
								}
								clearTimeout(timeout);
								timeout = setTimeout(async () => {
									await querySpecies(target.value);
								}, backoff);
							}}
						/>

						{#if speciesData}
							{#if speciesData.length > 0}
								<Command.List title="Available species">
									{#each speciesData as species}
										<CommandItem2
											onclick={() => {
												$form.tree_species = species.id.toString();
												selectedSpeciesName = species.name;
											}}
										>
											<Leaf class="mr-2 h-4 w-4" />
											<div>{species.name}</div>
											<Command.Shortcut>ID: {species.id}</Command.Shortcut>
										</CommandItem2>
									{/each}
								</Command.List>
							{:else}
								<Command.Empty>No species found.</Command.Empty>
							{/if}
						{/if}
					</Command.Root>
				{/if}

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
