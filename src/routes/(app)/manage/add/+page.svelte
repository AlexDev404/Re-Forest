<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/vendor/ui/button';
	import * as Command from '$lib/components/vendor/ui/command';
	import CommandItem2 from '$lib/components/vendor/ui/command/command-item2.svelte';
	import { Input } from '$lib/components/vendor/ui/input';
	import { Label } from '$lib/components/vendor/ui/label';
	import { type ReverseGeoJSON } from '$lib/types/GeoJSON';
	import { getReverseLoc } from '$lib/utility/utility';
	import { AlertTriangle, Building2, CheckCircle2, ImageUp, Leaf, MapPin, UploadCloud, User, X } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const { form, errors, constraints, enhance } = superForm(data.form, {
		onSubmit: () => {
			// Save form state before submission
			saveFormState();
		},
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				// Clear form state on successful submission
				clearFormState();
			}
		}
	});
	let treeImageSrc: string | null = $state(null);
	let speciesData = $state<{ id: number; name: string }[] | null>(null);
	let selectedSpeciesName = $state<string | null>(null);
	
	// New: Planter type selection
	let planterType: 'INDIVIDUAL' | 'ORGANIZATION' | null = $state(null);

	// Location handling
	let tree_added = $state(false); // Svelte 5 rune
	let location: GeolocationCoordinates | (string | null) = $state(null);
	let translated_location: string | null = $state(null);
	let timeout: ReturnType<typeof setTimeout>;
	let backoff = $state(500); // Svelte 5 rune, though likely doesn't need to be reactive unless changed by UI

	// Form state persistence
	const FORM_STATE_KEY = 'greening_belize_form_state';

	function saveFormState() {
		const formState = {
			tree_name: $form.tree_name,
			tree_species_text: $form.tree_species_text,
			tree_height: $form.tree_height,
			tree_age: $form.tree_age,
			planter_type: $form.planter_type,
			organization_name: $form.organization_name,
			planting_reason: $form.planting_reason,
			hashtags: $form.hashtags,
			quantity: $form.quantity,
			area_hectares: $form.area_hectares,
			tree_image: $form.tree_image,
			planterType: planterType,
			treeImageSrc: treeImageSrc
		};
		localStorage.setItem(FORM_STATE_KEY, JSON.stringify(formState));
	}

	function restoreFormState() {
		const savedState = localStorage.getItem(FORM_STATE_KEY);
		if (savedState) {
			try {
				const formState = JSON.parse(savedState);
				$form.tree_name = formState.tree_name || '';
				$form.tree_species_text = formState.tree_species_text || '';
				$form.tree_height = formState.tree_height || undefined;
				$form.tree_age = formState.tree_age || undefined;
				$form.planter_type = formState.planter_type || 'INDIVIDUAL';
				$form.organization_name = formState.organization_name || '';
				$form.planting_reason = formState.planting_reason || '';
				$form.hashtags = formState.hashtags || '';
				$form.quantity = formState.quantity || undefined;
				$form.area_hectares = formState.area_hectares || undefined;
				$form.tree_image = formState.tree_image || '';
				planterType = formState.planterType || null;
				treeImageSrc = formState.treeImageSrc || null;
			} catch (e) {
				console.error("Error restoring form state:", e);
			}
		}
	}

	function clearFormState() {
		localStorage.removeItem(FORM_STATE_KEY);
	}

	// Function to fetch tree species
	async function querySpecies(query: string = '') {
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
		// Restore form state first
		restoreFormState();

		// Fetch initial species list
		await querySpecies();

		// Get location data
		const storedLocation = localStorage.getItem('location');
		if (storedLocation) {
			try {
				const parsedLocation = JSON.parse(storedLocation);
				if (parsedLocation && typeof parsedLocation.latitude === 'number' && typeof parsedLocation.longitude === 'number') {
					location = parsedLocation;
					const reverse_location: ReverseGeoJSON | null = await getReverseLoc(
						parsedLocation.latitude,
						parsedLocation.longitude
					);
					if (reverse_location) {
						translated_location = reverse_location.display_name;
					}
				}
			} catch (e) {
				console.error("Error parsing location from localStorage", e);
				location = null; // Reset if parsing fails
			}
		}

		// Save form state on input changes
		const formElement = document.querySelector('form');
		if (formElement) {
			formElement.addEventListener('input', saveFormState);
		}

		// Clear form state on successful submission
		return () => {
			if (formElement) {
				formElement.removeEventListener('input', saveFormState);
			}
		};
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
					console.error('Upload failed:', data);
					// TODO: Show user-friendly error
				}
			} catch (error) {
				console.error('Error uploading file:', error);
				// TODO: Show user-friendly error
			} finally {
				uploading = false;
			}
		}
	}
</script>

<svelte:head>
	<title>Greening Belize :: Add New Tree - Enterprise</title>
</svelte:head>

<page class="block min-h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-y-auto pb-24">
	<main class="mx-auto w-full max-w-4xl px-4 sm:px-6 py-10 sm:py-16 flex flex-col gap-10">
		<header class="flex flex-col items-start gap-2.5 pb-8">
			<a href="/manage" class="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mb-2">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
				Return to Tree Management
			</a>
			<h1 class="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
				Register New Tree Planting
			</h1>
			<p class="text-sm text-muted-foreground">Provide details about your tree planting activity.</p>
		</header>

		<!-- Planter Type Selection -->
		{#if !planterType}
		<div class="bg-card shadow rounded-xl border border-border p-8 flex flex-col gap-6">
			<div class="text-center">
				<h2 class="text-lg font-semibold text-foreground mb-2">Who is planting?</h2>
				<p class="text-sm text-muted-foreground">Select whether you are planting as an individual or on behalf of an organization.</p>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<button
					type="button"
					onclick={() => { planterType = 'INDIVIDUAL'; $form.planter_type = 'INDIVIDUAL'; }}
					class="flex flex-col items-center gap-4 p-6 rounded-lg border-2 border-border bg-background hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer group"
				>
					<div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
						<User class="w-8 h-8 text-primary" />
					</div>
					<div class="text-center">
						<h3 class="font-semibold text-foreground mb-1">Individual</h3>
						<p class="text-xs text-muted-foreground">Planting trees on your own or as a personal effort</p>
					</div>
				</button>
				<button
					type="button"
					onclick={() => { planterType = 'ORGANIZATION'; $form.planter_type = 'ORGANIZATION'; }}
					class="flex flex-col items-center gap-4 p-6 rounded-lg border-2 border-border bg-background hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer group"
				>
					<div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
						<Building2 class="w-8 h-8 text-primary" />
					</div>
					<div class="text-center">
						<h3 class="font-semibold text-foreground mb-1">Organization</h3>
						<p class="text-xs text-muted-foreground">Planting as part of a school, NGO, company, or community group</p>
					</div>
				</button>
			</div>
		</div>
		{:else}
		<!-- Selected Planter Type Display -->
		<div class="bg-card shadow rounded-xl border border-border p-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				{#if planterType === 'INDIVIDUAL'}
					<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
						<User class="w-5 h-5 text-primary" />
					</div>
					<div>
						<p class="text-sm font-medium text-foreground">Planting as Individual</p>
						<p class="text-xs text-muted-foreground">Personal tree planting effort</p>
					</div>
				{:else}
					<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
						<Building2 class="w-5 h-5 text-primary" />
					</div>
					<div>
						<p class="text-sm font-medium text-foreground">Planting as Organization</p>
						<p class="text-xs text-muted-foreground">Organization or group planting effort</p>
					</div>
				{/if}
			</div>
			<Button
				variant="ghost"
				size="sm"
				onclick={() => { planterType = null; $form.planter_type = 'INDIVIDUAL'; }}
				class="text-xs"
			>
				Change
			</Button>
		</div>
		{/if}

		{#if planterType}
		<!-- Image Upload Card -->
		<div class="bg-card shadow rounded-xl border border-border p-8 flex flex-col items-center gap-6 text-center">
			<div class="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-muted border-2 border-background shadow-inner flex items-center justify-center overflow-hidden mb-2 transition-all duration-300 ease-out {treeImageSrc ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'ring-1 ring-border'}">
				{#if treeImageSrc}
					<img src={treeImageSrc} alt="Tree preview" class="object-cover w-full h-full" />
				{:else}
					<ImageUp class="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground opacity-60" />
				{/if}
			</div>
			<h2 class="text-md font-medium text-card-foreground">Tree Photograph</h2>
			<p class="text-xs text-muted-foreground/80 max-w-xs">
				{treeImageSrc ? 'Current photo. Use button below to change.' : 'Upload a clear photograph of the tree(s).'}
			</p>
			<Button 
				variant="outline"
				class="w-full sm:w-auto mt-2 text-sm font-medium rounded-md px-4 py-2 shadow-sm hover:bg-muted disabled:opacity-70 disabled:cursor-not-allowed"
				onclick={handlePhotoClick} 
				disabled={uploading}
			>
				{#if uploading}
					<UploadCloud class="mr-2 h-4 w-4 animate-spin group-disabled:animate-none" />
					Processing...
				{:else if treeImageSrc}
					<ImageUp class="mr-2 h-4 w-4" />
					Update Photo
				{:else}
					<UploadCloud class="mr-2 h-4 w-4" />
					Upload Photo
				{/if}
			</Button>
			{#if $errors.tree_image}
				<p class="text-xs text-destructive flex items-center gap-1 mt-1">
					<AlertTriangle class="h-3.5 w-3.5" /> {$errors.tree_image}
				</p>
			{/if}
		</div>

		<form method="POST" class="flex w-full flex-col gap-6 bg-card shadow rounded-xl border border-border p-8 sm:p-10" use:enhance>
			<input type="hidden" name="tree_lat" value={typeof location === 'object' && location?.latitude} />
			<input type="hidden" name="tree_lng" value={typeof location === 'object' && location?.longitude} />
			<input type="hidden" name="tree_image" bind:value={$form.tree_image} />
			<input type="hidden" name="planter_type" bind:value={$form.planter_type} />

			<!-- Organization Name (only for organizations) -->
			{#if planterType === 'ORGANIZATION'}
			<div class="grid w-full items-center gap-2">
				<Label for="organization_name" class="text-sm font-medium text-foreground flex items-center gap-1.5">
					<Building2 class="h-4 w-4 text-primary/80" /> Organization Name <span class="text-destructive text-xs">*</span>
				</Label>
				<Input
					type="text"
					name="organization_name"
					id="organization_name"
					placeholder="e.g., Belize Forest Department, Green Earth NGO"
					bind:value={$form.organization_name}
					class="w-full text-sm px-3 py-2 rounded-md border-input focus:ring-ring focus:border-ring shadow-sm transition-colors duration-200"
					required={planterType === 'ORGANIZATION'}
				/>
			</div>
			{/if}

			<!-- Tree Name / Description -->
			<div class="grid w-full items-center gap-2">
				<Label for="tree_name" class="text-sm font-medium text-foreground flex items-center gap-1.5">
					<Leaf class="h-4 w-4 text-primary/80" /> {planterType === 'INDIVIDUAL' ? 'Tree/Plant Name' : 'Planting Description'} <span class="text-destructive text-xs">*</span>
				</Label>
				<Input
					type="text"
					name="tree_name"
					id="tree_name"
					placeholder={planterType === 'INDIVIDUAL' ? 'e.g., Mahogany Tree, Coconut Palm' : 'e.g., Reforestation Project 2026'}
					bind:value={$form.tree_name}
					class="w-full text-sm px-3 py-2 rounded-md border-input focus:ring-ring focus:border-ring shadow-sm transition-colors duration-200 { $errors.tree_name ? 'border-destructive focus:ring-destructive focus:border-destructive' : '' }"
					required
					aria-invalid={$errors.tree_name ? true : undefined}
					aria-describedby={$errors.tree_name ? 'tree_name-error' : undefined}
				/>
				{#if $errors.tree_name}
					<p id="tree_name-error" class="text-xs text-destructive flex items-center gap-1">
						<AlertTriangle class="h-3.5 w-3.5" /> {$errors.tree_name}
					</p>
				{/if}
			</div>

			<!-- Quantity (for individuals) or Area (for organizations) -->
			{#if planterType === 'INDIVIDUAL'}
			<div class="grid w-full items-center gap-2">
				<Label for="quantity" class="text-sm font-medium text-foreground flex items-center gap-1.5">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/80"><text x="12" y="18" text-anchor="middle" font-size="14" fill="currentColor">#</text></svg>
					Quantity (number of trees/plants)
				</Label>
				<Input
					type="number"
					name="quantity"
					id="quantity"
					placeholder="e.g., 1, 50"
					bind:value={$form.quantity}
					class="w-full text-sm px-3 py-2 rounded-md border-input focus:ring-ring focus:border-ring shadow-sm transition-colors duration-200"
					min="1"
				/>
				<p class="text-xs text-muted-foreground">If planting multiple trees of the same type (e.g., 50 hedges), enter the quantity here.</p>
			</div>
			{:else}
			<div class="grid w-full items-center gap-2">
				<Label for="area_hectares" class="text-sm font-medium text-foreground flex items-center gap-1.5">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/80"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
					Area (hectares)
				</Label>
				<Input
					type="number"
					name="area_hectares"
					id="area_hectares"
					placeholder="e.g., 2.5"
					bind:value={$form.area_hectares}
					class="w-full text-sm px-3 py-2 rounded-md border-input focus:ring-ring focus:border-ring shadow-sm transition-colors duration-200"
					min="0.01"
					step="0.01"
				/>
				<p class="text-xs text-muted-foreground">1 hectare = 2.47 acres. Enter the approximate area being planted/reforested.</p>
			</div>
			{/if}

			<!-- Tree Height (optional for both) -->
			<div class="grid w-full items-center gap-2">
				<Label for="tree_height" class="text-sm font-medium text-foreground flex items-center gap-1.5">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/80"><line x1="12" y1="2" x2="12" y2="22"></line><polyline points="18 6 12 2 6 6"></polyline><polyline points="18 18 12 22 6 18"></polyline></svg>
					Height (meters) <span class="text-muted-foreground text-xs">(optional)</span>
				</Label>
				<Input
					type="number"
					name="tree_height"
					id="tree_height"
					placeholder="e.g., 1.5"
					bind:value={$form.tree_height}
					class="w-full text-sm px-3 py-2 rounded-md border-input focus:ring-ring focus:border-ring shadow-sm transition-colors duration-200 { $errors.tree_height ? 'border-destructive focus:ring-destructive focus:border-destructive' : '' }"
					min="0.1"
					step="0.01"
					aria-invalid={$errors.tree_height ? true : undefined}
					aria-describedby={$errors.tree_height ? 'tree_height-error' : undefined}
				/>
				{#if $errors.tree_height}
					<p id="tree_height-error" class="text-xs text-destructive flex items-center gap-1">
						<AlertTriangle class="h-3.5 w-3.5" /> {$errors.tree_height}
					</p>
				{/if}
			</div>

			<!-- Tree Age (optional) -->
			<div class="grid w-full items-center gap-2">
				<Label for="tree_age" class="text-sm font-medium text-foreground flex items-center gap-1.5">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/80"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
					Tree Age (years) <span class="text-muted-foreground text-xs">(optional)</span>
				</Label>
				<Input
					type="number"
					name="tree_age"
					id="tree_age"
					bind:value={$form.tree_age}
					placeholder="e.g., 1"
					class="w-full text-sm px-3 py-2 rounded-md border-input focus:ring-ring focus:border-ring shadow-sm transition-colors duration-200 { $errors.tree_age ? 'border-destructive focus:ring-destructive focus:border-destructive' : '' }"
					min="0"
					aria-invalid={$errors.tree_age ? true : undefined}
					aria-describedby={$errors.tree_age ? 'tree_age-error' : undefined}
				/>
				{#if $errors.tree_age}
					<p id="tree_age-error" class="text-xs text-destructive flex items-center gap-1">
						<AlertTriangle class="h-3.5 w-3.5" /> {$errors.tree_age}
					</p>
				{/if}
			</div>

			<!-- Tree Species (Free Text) - HIDDEN DROPDOWN BELOW -->
			<div class="grid w-full items-center gap-2">
				<Label for="tree_species_text" class="text-sm font-medium text-foreground flex items-center gap-1.5">
					<Leaf class="h-4 w-4 text-primary/80" /> Tree Species <span class="text-muted-foreground text-xs">(optional)</span>
				</Label>
				<Input
					type="text"
					name="tree_species_text"
					id="tree_species_text"
					placeholder="e.g., Mahogany, Cedar, Pine"
					bind:value={$form.tree_species_text}
					class="w-full text-sm px-3 py-2 rounded-md border-input focus:ring-ring focus:border-ring shadow-sm transition-colors duration-200"
					maxlength="255"
				/>
				<p class="text-xs text-muted-foreground">Enter the common or scientific name of the tree species.</p>
			</div>

			<!-- HIDDEN: Tree Species Dropdown (kept for future use) -->
			<div class="hidden">
				<Label for="tree_species_search" class="text-sm font-medium text-foreground flex items-center gap-1.5">
					<Leaf class="h-4 w-4 text-primary/80" /> Tree Species (Common Name) <span class="text-muted-foreground text-xs">(optional)</span>
				</Label>
				<input type="hidden" name="tree_species" id="tree_species" bind:value={$form.tree_species} />

				{#if selectedSpeciesName}
					<div class="mb-1 flex items-center justify-between rounded-md border border-input bg-muted/50 p-2.5 shadow-sm">
						<div class="flex items-center gap-2 text-foreground">
							<CheckCircle2 class="h-4 w-4 text-green-600" />
							<span class="text-sm font-medium">{selectedSpeciesName}</span>
						</div>
						<Button
							variant="ghost"
							size="sm"
							class="h-7 px-2 text-xs text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-foreground"
							onclick={() => {
								selectedSpeciesName = null;
								$form.tree_species = '';
								querySpecies(); // Reset search or fetch all
							}}
						>
							<X class="mr-1 h-3.5 w-3.5" /> Change
						</Button>
					</div>
				{/if}

				{#if !selectedSpeciesName}
					<Command.Root class="w-full rounded-md border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all duration-200 { $errors.tree_species ? 'border-destructive focus-within:ring-destructive focus-within:border-destructive' : '' }">
						<Command.Input
							id="tree_species_search"
							class="w-full h-9 px-3 text-sm border-0 focus:ring-0 bg-transparent placeholder-muted-foreground/60"
							placeholder="Search and select species..."
							aria-invalid={$errors.tree_species ? true : undefined}
							aria-describedby={$errors.tree_species ? 'tree_species-error' : undefined}
							oninput={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
								const target = e.currentTarget;
								clearTimeout(timeout);
								timeout = setTimeout(async () => {
									await querySpecies(target.value);
								}, backoff);
							}}
						/>
						{#if speciesData}
							<Command.List class="max-h-[180px] overflow-y-auto p-1">
								{#if speciesData.length > 0}
									{#each speciesData as species (species.id)}
										<CommandItem2
											class="flex justify-between items-center p-2 rounded hover:bg-muted cursor-pointer transition-colors duration-150 text-sm text-foreground data-[selected]:bg-primary/10 data-[selected]:text-primary"
											onclick={() => {
												$form.tree_species = species.id.toString();
												selectedSpeciesName = species.name;
											}}
										>
											<div class="flex items-center">
												<Leaf class="mr-2 h-3.5 w-3.5 text-primary/70" />
												<span class="text-xs">{species.name}</span>
											</div>
											<Command.Shortcut class="text-xs text-muted-foreground">ID: {species.id}</Command.Shortcut>
										</CommandItem2>
									{/each}
								{:else}
									<Command.Empty class="p-3 text-xs text-center text-muted-foreground">No species found.</Command.Empty>
								{/if}
							</Command.List>
						{:else if !speciesData && selectedSpeciesName === null} <!-- Show loading or initial prompt -->
							<div class="p-3 text-xs text-center text-muted-foreground">Begin typing to search species.</div>
						{/if}
					</Command.Root>
				{/if}
				{#if $errors.tree_species}
					<p id="tree_species-error" class="text-xs text-destructive flex items-center gap-1 mt-0.5">
						<AlertTriangle class="h-3.5 w-3.5" /> {$errors.tree_species}
					</p>
				{/if}
			</div>

			<!-- Planting Reason -->
			<div class="grid w-full items-center gap-2">
				<Label for="planting_reason" class="text-sm font-medium text-foreground flex items-center gap-1.5">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/80"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
					Reason for Planting
				</Label>
				<textarea
					name="planting_reason"
					id="planting_reason"
					bind:value={$form.planting_reason}
					placeholder="e.g., Reforestation effort, beautification, climate action"
					class="w-full text-sm px-3 py-2 rounded-md border-input focus:ring-ring focus:border-ring shadow-sm transition-colors duration-200 min-h-[80px] resize-y"
					maxlength="1000"
				></textarea>
				<p class="text-xs text-muted-foreground">Share why you're planting these trees.</p>
			</div>

			<!-- Hashtags -->
			<div class="grid w-full items-center gap-2">
				<Label for="hashtags" class="text-sm font-medium text-foreground flex items-center gap-1.5">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/80"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
					Tags <span class="text-muted-foreground text-xs">(optional)</span>
				</Label>
				<Input
					type="text"
					name="hashtags"
					id="hashtags"
					bind:value={$form.hashtags}
					placeholder="e.g., #climateaction #reforestation #belize"
					class="w-full text-sm px-3 py-2 rounded-md border-input focus:ring-ring focus:border-ring shadow-sm transition-colors duration-200"
					maxlength="500"
				/>
				<p class="text-xs text-muted-foreground">Add relevant tags to categorize your planting (separate with spaces or commas).</p>
			</div>

			<!-- Location Info & Picker -->
			<div class="grid w-full items-center gap-3 rounded-xl border border-border bg-muted/30 dark:bg-slate-800/30 p-6 shadow">
				<Label class="text-sm font-medium text-foreground flex items-center gap-1.5">
					<MapPin class="h-4 w-4 text-primary/80" /> Planting Location
				</Label>
				{#if translated_location}
					<p class="text-xs text-muted-foreground">
						Current: <strong class="font-medium text-foreground">{translated_location}</strong>
					</p>
					{#if typeof location === 'object' && location?.latitude && location?.longitude}
						<p class="text-xs text-muted-foreground/70">
							(Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)})
						</p>
					{/if}
				{:else}
					<p class="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-500/30 p-2.5 rounded-md flex items-center gap-1.5">
						<AlertTriangle class="h-4 w-4" /> Location not set. Please specify location.
					</p>
				{/if}
				<Button
					type="button" 
					variant="outline"
					onclick={openMapPicker}
					class="w-full sm:w-auto mt-1 bg-background hover:bg-slate-100 dark:hover:bg-slate-700 text-foreground text-sm font-medium rounded-md px-4 py-2 border-input shadow-sm hover:shadow-md transition-all duration-200 ease-out flex items-center justify-center gap-1.5"
				>
					<MapPin class="h-4 w-4" /> {translated_location ? 'Modify Location' : 'Set Location via Map'}
				</Button>
			</div>

			{#if $errors._errors}
				<p class="text-sm font-medium text-destructive bg-destructive/10 border border-destructive/30 p-3 rounded-md flex items-center gap-2">
					<AlertTriangle class="h-5 w-5" /> {$errors._errors}
				</p>
			{/if}

			<Button 
				type="submit" 
				class="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md px-5 py-2.5 text-sm shadow hover:shadow-md transition-all duration-200 ease-out flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
				disabled={uploading || !location || !planterType}
			>
				<Leaf class="mr-1.5 h-5 w-5 group-hover:scale-110 transition-transform" /> Submit Tree Planting
			</Button>
		</form>
		{/if}
	</main>
</page>

<input
	type="file"
	accept="image/jpeg,image/png,image/webp,image/heic"
	bind:this={fileInput}
	onchange={handleFileSelect}
	class="hidden"
/>

<style>
	:global(body) {
		overflow: auto;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
	/* Consider adding a more corporate/system font stack if not already defined by Tailwind's sans preset */
	/* :global(body) { font-family: system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif; } */
</style>
