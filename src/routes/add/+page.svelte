<script lang="ts">
	import { Button } from '$lib/components/vendor/ui/button';
	import IconCard from '$lib/components/vendor/ui/icon-card/icon-card.svelte';

	// Location handling
	let currentLocation: GeolocationCoordinates | null = null;

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
			avatarFallback="SK"
			title={'Click to add a photo'}
			description={'Click to insert a photo of the tree'}
			on:click={handlePhotoClick}
		>
			<svelte:fragment slot="content1">
				<Button class="w-full" on:click={handlePhotoClick}>Or select from your gallery</Button>
			</svelte:fragment>
		</IconCard>
		<IconCard
			avatarSrc="null"
			avatarFallback="✏️"
			title={'Click to edit tree name'}
			description={'Click to edit tree description'}
		>
			<svelte:fragment slot="content1">
				<Button class="w-full">Add this tree</Button>
			</svelte:fragment>
		</IconCard>
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
