<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/vendor/ui/button';
	import * as Command from '$lib/components/vendor/ui/command';
	import CommandItem2 from '$lib/components/vendor/ui/command/command-item2.svelte';
	import { Input } from '$lib/components/vendor/ui/input';
	import { Label } from '$lib/components/vendor/ui/label';
	import { Switch } from '$lib/components/vendor/ui/switch';
	import { type ReverseGeoJSON } from '$lib/types/GeoJSON';
	import { getReverseLoc } from '$lib/utility/utility';
	import {
		AlertTriangle,
		Building2,
		CheckCircle2,
		ImageUp,
		Leaf,
		MapPin,
		UploadCloud,
		User,
		X
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { superForm } from 'sveltekit-superforms/client';
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
	let showNonTimber = $state(false); // Switch state for filtering timber/non-timber

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
			treeImageSrc: treeImageSrc,
			showNonTimber: showNonTimber
		};
		sessionStorage.setItem(FORM_STATE_KEY, JSON.stringify(formState));
	}

	function restoreFormState() {
		const savedState = sessionStorage.getItem(FORM_STATE_KEY);
		if (savedState) {
			try {
				const formState = JSON.parse(savedState);
				$form.tree_name = formState.tree_name || '';
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
				showNonTimber = formState.showNonTimber || false;
			} catch (e) {
				console.error('Error restoring form state:', e);
			}
		}
	}

	function clearFormState() {
		sessionStorage.removeItem(FORM_STATE_KEY);
	}

	// Function to fetch tree species
	async function querySpecies(query: string = '') {
		try {
			// Filter by is_timber based on switch state
			const isTimberParam = showNonTimber ? 'false' : 'true';
			const response = await fetch(`/api/tree-species?q=${query}&limit=10&is_timber=${isTimberParam}`);
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
				if (
					parsedLocation &&
					typeof parsedLocation.latitude === 'number' &&
					typeof parsedLocation.longitude === 'number'
				) {
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
				console.error('Error parsing location from localStorage', e);
				location = null; // Reset if parsing fails
			}
		}
	});
	// Save form state on input changes
	let formElement: HTMLFormElement | null = $state(null);
	$effect(() => {
		if (formElement !== null) {
			formElement.submitted = false;
			console.info('Attaching input listener for form state persistence');
			formElement.addEventListener('input', saveFormState);
		}
	});

	// Clear form state on successful submission
	$effect(() => {
		if (formElement !== null && formElement.submitted !== false) {
			console.info('Clearing form state after submission');
			formElement.removeEventListener('input', saveFormState);
		}
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

<page class="block min-h-screen overflow-y-auto bg-slate-50 pb-24 font-sans dark:bg-slate-900">
	<main class="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-16">
		<header class="flex flex-col items-start gap-2.5 pb-8">
			<!-- <a href="/manage" class="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mb-2">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
				Return to Tree Management
			</a> -->
			<h1 class="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
				Plant a New Tree
			</h1>
			<p class="text-sm text-muted-foreground">
				Provide details about your tree planting activity.
			</p>
		</header>

		<!-- Planter Type Selection -->
		{#if !planterType}
			<div class="flex flex-col gap-6 rounded-xl border border-border bg-card p-8 shadow">
				<div class="text-center">
					<h2 class="mb-2 text-lg font-semibold text-foreground">Who is planting?</h2>
					<p class="text-sm text-muted-foreground">
						Select whether you are planting as an individual or on behalf of an organization.
					</p>
				</div>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<button
						type="button"
						onclick={() => {
							planterType = 'INDIVIDUAL';
							$form.planter_type = 'INDIVIDUAL';
							// attachFormParasite();
						}}
						class="group flex cursor-pointer flex-col items-center gap-4 rounded-lg border-2 border-border bg-background p-6 transition-all duration-200 hover:border-primary hover:bg-primary/5"
					>
						<div
							class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20"
						>
							<User class="h-8 w-8 text-primary" />
						</div>
						<div class="text-center">
							<h3 class="mb-1 font-semibold text-foreground">Individual</h3>
							<p class="text-xs text-muted-foreground">
								Planting trees on your own or as a personal effort
							</p>
						</div>
					</button>
					<button
						type="button"
						onclick={() => {
							planterType = 'ORGANIZATION';
							$form.planter_type = 'ORGANIZATION';
							// attachFormParasite();
						}}
						class="group flex cursor-pointer flex-col items-center gap-4 rounded-lg border-2 border-border bg-background p-6 transition-all duration-200 hover:border-primary hover:bg-primary/5"
					>
						<div
							class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20"
						>
							<Building2 class="h-8 w-8 text-primary" />
						</div>
						<div class="text-center">
							<h3 class="mb-1 font-semibold text-foreground">Organization</h3>
							<p class="text-xs text-muted-foreground">
								Planting as part of a school, NGO, company, or community group
							</p>
						</div>
					</button>
				</div>
			</div>
		{:else}
			<!-- Selected Planter Type Display -->
			<div
				class="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow"
			>
				<div class="flex items-center gap-3">
					{#if planterType === 'INDIVIDUAL'}
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
							<User class="h-5 w-5 text-primary" />
						</div>
						<div>
							<p class="text-sm font-medium text-foreground">Planting as Individual</p>
							<p class="text-xs text-muted-foreground">Personal tree planting effort</p>
						</div>
					{:else}
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
							<Building2 class="h-5 w-5 text-primary" />
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
					onclick={() => {
						planterType = null;
						$form.planter_type = 'INDIVIDUAL';
					}}
					class="text-xs"
				>
					Change
				</Button>
			</div>
		{/if}

		{#if planterType}
			<!-- Image Upload Card -->
			<div
				class="flex flex-col items-center gap-6 rounded-xl border border-border bg-card p-8 text-center shadow"
			>
				<div
					class="mb-2 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-muted shadow-inner transition-all duration-300 ease-out sm:h-32 sm:w-32 {treeImageSrc
						? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
						: 'ring-1 ring-border'}"
				>
					{#if treeImageSrc}
						<img src={treeImageSrc} alt="Tree preview" class="h-full w-full object-cover" />
					{:else}
						<ImageUp class="h-10 w-10 text-muted-foreground opacity-60 sm:h-12 sm:w-12" />
					{/if}
				</div>
				<h2 class="text-md font-medium text-card-foreground">Tree Photograph</h2>
				<p class="max-w-xs text-xs text-muted-foreground/80">
					{treeImageSrc
						? 'Current photo. Use button below to change.'
						: 'Upload a clear photograph of the tree(s).'}
				</p>
				<Button
					variant="outline"
					class="mt-2 w-full rounded-md px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
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
					<p class="mt-1 flex items-center gap-1 text-xs text-destructive">
						<AlertTriangle class="h-3.5 w-3.5" />
						{$errors.tree_image}
					</p>
				{/if}
			</div>

			<form
				bind:this={formElement}
				method="POST"
				class="flex w-full flex-col gap-6 rounded-xl border border-border bg-card p-8 shadow sm:p-10"
				use:enhance
			>
				<input
					type="hidden"
					name="tree_lat"
					value={typeof location === 'object' && location?.latitude}
				/>
				<input
					type="hidden"
					name="tree_lng"
					value={typeof location === 'object' && location?.longitude}
				/>
				<input type="hidden" name="tree_image" bind:value={$form.tree_image} />
				<input type="hidden" name="planter_type" bind:value={$form.planter_type} />

				<!-- Organization Name (only for organizations) -->
				{#if planterType === 'ORGANIZATION'}
					<div class="grid w-full items-center gap-2">
						<Label
							for="organization_name"
							class="flex items-center gap-1.5 text-sm font-medium text-foreground"
						>
							<Building2 class="h-4 w-4 text-primary/80" /> Organization Name
							<span class="text-xs text-destructive">*</span>
						</Label>
						<Input
							type="text"
							name="organization_name"
							id="organization_name"
							placeholder="e.g., Belize Forest Department, Green Earth NGO"
							bind:value={$form.organization_name}
							class="w-full rounded-md border-input px-3 py-2 text-sm shadow-sm transition-colors duration-200 focus:border-ring focus:ring-ring"
							required={planterType === 'ORGANIZATION'}
						/>
					</div>
				{/if}

				<!-- Tree Name / Description -->
				<div class="grid w-full items-center gap-2">
					<Label
						for="tree_name"
						class="flex items-center gap-1.5 text-sm font-medium text-foreground"
					>
						<Leaf class="h-4 w-4 text-primary/80" />
						{planterType === 'INDIVIDUAL' ? 'Tree/Plant Name' : 'Planting Description'}
						<span class="text-xs text-destructive">*</span>
					</Label>
					<Input
						type="text"
						name="tree_name"
						id="tree_name"
						placeholder={planterType === 'INDIVIDUAL'
							? 'e.g., Mahogany Tree, Coconut Palm'
							: 'e.g., Reforestation Project 2026'}
						bind:value={$form.tree_name}
						class="w-full rounded-md border-input px-3 py-2 text-sm shadow-sm transition-colors duration-200 focus:border-ring focus:ring-ring {$errors.tree_name
							? 'border-destructive focus:border-destructive focus:ring-destructive'
							: ''}"
						required
						aria-invalid={$errors.tree_name ? true : undefined}
						aria-describedby={$errors.tree_name ? 'tree_name-error' : undefined}
					/>
					{#if $errors.tree_name}
						<p id="tree_name-error" class="flex items-center gap-1 text-xs text-destructive">
							<AlertTriangle class="h-3.5 w-3.5" />
							{$errors.tree_name}
						</p>
					{/if}
				</div>

				<!-- Quantity (for individuals) or Area (for organizations) -->
				{#if planterType === 'INDIVIDUAL'}
					<div class="grid w-full items-center gap-2">
						<Label
							for="quantity"
							class="flex items-center gap-1.5 text-sm font-medium text-foreground"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="text-primary/80"
								><text x="12" y="18" text-anchor="middle" font-size="14" fill="currentColor">#</text
								></svg
							>
							Quantity (number of trees/plants)
						</Label>
						<Input
							type="number"
							name="quantity"
							id="quantity"
							placeholder="e.g., 1, 50"
							bind:value={$form.quantity}
							class="w-full rounded-md border-input px-3 py-2 text-sm shadow-sm transition-colors duration-200 focus:border-ring focus:ring-ring"
							min="1"
						/>
						<p class="text-xs text-muted-foreground">
							If planting multiple trees of the same type (e.g., 50 hedges), enter the quantity
							here.
						</p>
					</div>
				{:else}
					<div class="grid w-full items-center gap-2">
						<Label
							for="area_hectares"
							class="flex items-center gap-1.5 text-sm font-medium text-foreground"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="text-primary/80"><rect x="3" y="3" width="18" height="18" rx="2" /></svg
							>
							Area (hectares)
						</Label>
						<Input
							type="number"
							name="area_hectares"
							id="area_hectares"
							placeholder="e.g., 2.5"
							bind:value={$form.area_hectares}
							class="w-full rounded-md border-input px-3 py-2 text-sm shadow-sm transition-colors duration-200 focus:border-ring focus:ring-ring"
							min="0.01"
							step="0.01"
						/>
						<p class="text-xs text-muted-foreground">
							1 hectare = 2.47 acres. Enter the approximate area being planted/reforested.
						</p>
					</div>
				{/if}

				<!-- Tree Height (optional for both) -->
				<div class="grid w-full items-center gap-2">
					<Label
						for="tree_height"
						class="flex items-center gap-1.5 text-sm font-medium text-foreground"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-primary/80"
							><line x1="12" y1="2" x2="12" y2="22"></line><polyline points="18 6 12 2 6 6"
							></polyline><polyline points="18 18 12 22 6 18"></polyline></svg
						>
						Height (meters) <span class="text-xs text-muted-foreground">(optional)</span>
					</Label>
					<Input
						type="number"
						name="tree_height"
						id="tree_height"
						placeholder="e.g., 1.5"
						bind:value={$form.tree_height}
						class="w-full rounded-md border-input px-3 py-2 text-sm shadow-sm transition-colors duration-200 focus:border-ring focus:ring-ring {$errors.tree_height
							? 'border-destructive focus:border-destructive focus:ring-destructive'
							: ''}"
						min="0.1"
						step="0.01"
						aria-invalid={$errors.tree_height ? true : undefined}
						aria-describedby={$errors.tree_height ? 'tree_height-error' : undefined}
					/>
					{#if $errors.tree_height}
						<p id="tree_height-error" class="flex items-center gap-1 text-xs text-destructive">
							<AlertTriangle class="h-3.5 w-3.5" />
							{$errors.tree_height}
						</p>
					{/if}
				</div>

				<!-- Tree Age (HIDDEN/optional) -->
				<div class="__grid__ w-full items-center gap-2 hidden">
					<Label
						for="tree_age"
						class="flex items-center gap-1.5 text-sm font-medium text-foreground"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-primary/80"
							><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"
							></polyline></svg
						>
						Tree Age (years) <span class="text-xs text-muted-foreground">(optional)</span>
					</Label>
					<Input
						type="number"
						name="tree_age"
						id="tree_age"
						bind:value={$form.tree_age}
						placeholder="e.g., 1"
						class="w-full rounded-md border-input px-3 py-2 text-sm shadow-sm transition-colors duration-200 focus:border-ring focus:ring-ring {$errors.tree_age
							? 'border-destructive focus:border-destructive focus:ring-destructive'
							: ''}"
						min="0"
						aria-invalid={$errors.tree_age ? true : undefined}
						aria-describedby={$errors.tree_age ? 'tree_age-error' : undefined}
					/>
					{#if $errors.tree_age}
						<p id="tree_age-error" class="flex items-center gap-1 text-xs text-destructive">
							<AlertTriangle class="h-3.5 w-3.5" />
							{$errors.tree_age}
						</p>
					{/if}
				</div>

				<!--  Tree Species Dropdown  -->
				<div class="grid w-full items-center gap-2">
					<div class="flex items-center justify-between">
						<Label
							for="tree_species_search"
							class="flex items-center gap-1.5 text-sm font-medium text-foreground"
						>
							<Leaf class="h-4 w-4 text-primary/80" /> Plant Species (Common Name)
							<!-- <span class="text-xs text-muted-foreground">(optional)</span> -->
						</Label>
						<div class="flex items-center gap-2">
							<span class="text-xs text-muted-foreground">
								{showNonTimber ? 'Fruit' : 'Timber'}
							</span>
							<Switch
								bind:checked={showNonTimber}
								onCheckedChange={async () => {
									// Reset selection when filter changes
									selectedSpeciesName = null;
									$form.tree_species = '';
									// Fetch species with new filter
									await querySpecies();
								}}
							/>
						</div>
					</div>
					<input
						type="hidden"
						name="tree_species"
						id="tree_species"
						bind:value={$form.tree_species}
					/>

					{#if selectedSpeciesName}
						<div
							class="mb-1 flex items-center justify-between rounded-md border border-input bg-muted/50 p-2.5 shadow-sm"
						>
							<div class="flex items-center gap-2 text-foreground">
								<CheckCircle2 class="h-4 w-4 text-green-600" />
								<span class="text-sm font-medium">{selectedSpeciesName}</span>
							</div>
							<Button
								variant="ghost"
								size="sm"
								class="h-7 px-2 text-xs text-muted-foreground hover:bg-slate-200 hover:text-foreground dark:hover:bg-slate-700"
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
						<Command.Root
							class="w-full rounded-md border border-input bg-background shadow-sm transition-all duration-200 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring {$errors.tree_species
								? 'border-destructive focus-within:border-destructive focus-within:ring-destructive'
								: ''}"
						>
							<Command.Input
								id="tree_species_search"
								class="h-9 w-full border-0 bg-transparent px-3 text-sm placeholder-muted-foreground/60 focus:ring-0"
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
												class="flex cursor-pointer items-center justify-between rounded p-2 text-sm text-foreground transition-colors duration-150 hover:bg-muted data-[selected]:bg-primary/10 data-[selected]:text-primary"
												onclick={() => {
													$form.tree_species = species.id.toString();
													selectedSpeciesName = species.name;
												}}
											>
												<div class="flex items-center">
													<Leaf class="mr-2 h-3.5 w-3.5 text-primary/70" />
													<span class="text-xs">{species.name}</span>
												</div>
												<Command.Shortcut class="text-xs text-muted-foreground"
													>ID: {species.id}</Command.Shortcut
												>
											</CommandItem2>
										{/each}
									{:else}
										<Command.Empty class="p-3 text-center text-xs text-muted-foreground"
											>No species found.</Command.Empty
										>
									{/if}
								</Command.List>
							{:else if !speciesData && selectedSpeciesName === null}
								<!-- Show loading or initial prompt -->
								<div class="p-3 text-center text-xs text-muted-foreground">
									Begin typing to search species.
								</div>
							{/if}
						</Command.Root>
					{/if}
					{#if $errors.tree_species}
						<p
							id="tree_species-error"
							class="mt-0.5 flex items-center gap-1 text-xs text-destructive"
						>
							<AlertTriangle class="h-3.5 w-3.5" />
							{$errors.tree_species}
						</p>
					{/if}
				</div>

				<!-- Planting Reason -->
				<div class="grid w-full items-center gap-2">
					<Label
						for="planting_reason"
						class="flex items-center gap-1.5 text-sm font-medium text-foreground"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-primary/80"
							><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg
						>
						Reason for Planting
					</Label>
					<textarea
						name="planting_reason"
						id="planting_reason"
						bind:value={$form.planting_reason}
						placeholder="e.g., Reforestation effort, beautification, climate action"
						class="min-h-[80px] w-full resize-y rounded-md border-input px-3 py-2 text-sm shadow-sm transition-colors duration-200 focus:border-ring focus:ring-ring"
						maxlength="1000"
					></textarea>
					<p class="text-xs text-muted-foreground">Share why you're planting these trees.</p>
				</div>

				<!-- Hashtags -->
				<div class="grid w-full items-center gap-2">
					<Label
						for="hashtags"
						class="flex items-center gap-1.5 text-sm font-medium text-foreground"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-primary/80"
							><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"
							></line><line x1="10" y1="3" x2="8" y2="21"></line><line
								x1="16"
								y1="3"
								x2="14"
								y2="21"
							></line></svg
						>
						Tags <span class="text-xs text-muted-foreground">(optional)</span>
					</Label>
					<Input
						type="text"
						name="hashtags"
						id="hashtags"
						bind:value={$form.hashtags}
						placeholder="e.g., #climateaction #reforestation #belize"
						class="w-full rounded-md border-input px-3 py-2 text-sm shadow-sm transition-colors duration-200 focus:border-ring focus:ring-ring"
						maxlength="500"
					/>
					<p class="text-xs text-muted-foreground">
						Add relevant tags to categorize your planting (separate with spaces or commas).
					</p>
				</div>

				<!-- Location Info & Picker -->
				<div
					class="grid w-full items-center gap-3 rounded-xl border border-border bg-muted/30 p-6 shadow dark:bg-slate-800/30"
				>
					<Label class="flex items-center gap-1.5 text-sm font-medium text-foreground">
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
						<p
							class="flex items-center gap-1.5 rounded-md border border-orange-200 bg-orange-50 p-2.5 text-xs text-orange-600 dark:border-orange-500/30 dark:bg-orange-900/30 dark:text-orange-400"
						>
							<AlertTriangle class="h-4 w-4" /> Location not set. Please specify location.
						</p>
					{/if}
					<Button
						type="button"
						variant="outline"
						onclick={openMapPicker}
						class="mt-1 flex w-full items-center justify-center gap-1.5 rounded-md border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all duration-200 ease-out hover:bg-slate-100 hover:shadow-md dark:hover:bg-slate-700 sm:w-auto"
					>
						<MapPin class="h-4 w-4" />
						{translated_location ? 'Modify Location' : 'Set Location via Map'}
					</Button>
				</div>

				{#if $errors._errors}
					<p
						class="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
					>
						<AlertTriangle class="h-5 w-5" />
						{$errors._errors}
					</p>
				{/if}

				<Button
					type="submit"
					onclick={() => {
						if (formElement) {
							formElement.submitted = true;
						}
					}}
					class="group mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow transition-all duration-200 ease-out hover:bg-primary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
					disabled={uploading || !location || !planterType}
				>
					<Leaf class="mr-1.5 h-5 w-5 transition-transform group-hover:scale-110" /> Submit Tree Planting
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
