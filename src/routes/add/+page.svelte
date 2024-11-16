<script lang="ts">
	import * as Alert from '$lib/components/vendor/ui/alert';
	import { Button } from '$lib/components/vendor/ui/button';
	import IconCard from '$lib/components/vendor/ui/icon-card/icon-card.svelte';
	import { Input } from '$lib/components/vendor/ui/input';
	import { Label } from '$lib/components/vendor/ui/label';
	import { Zap } from 'lucide-svelte';

	// Location handling
	let currentLocation: GeolocationCoordinates | null = null;
    let tree_added = false;

	async function getCurrentLocation() {
		try {
			const position = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject);
			});
			currentLocation = position.coords;
			console.log('Current location:', currentLocation);
		} catch (error) {
			alert('Error getting location: ' + error.message);
		}
	}

	function openMapPicker() {
		// This is a placeholder - you'll need to implement your map picker UI
		alert('Map picker functionality to be implemented');
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
</script>
<svelte:head>
    <title>Re:Forest :: Add</title>
</svelte:head>
<page class="overflow-y-auto">
	<main class="mx-6 my-10 flex flex-col items-start gap-12">
		<article class="flex items-start self-stretch">
			<div class="block w-full space-y-1">
				<h1 class="text-2xl font-semibold">New Tree</h1>
				<Button on:click={getCurrentLocation}>Grab my current location</Button>
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
						<Label for="name" class="text-right">Name</Label>
						<Input id="name" placeholder="Beech tree" class="col-span-3" />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="username" class="text-right">Label</Label>
						<Input id="username" placeholder="This tree is..." class="col-span-3" />
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
