<script lang="ts">
	import MenuItem from '$lib/components/vendor/ui/menuitem/menuitem.svelte';
	import { ChevronRight, Thermometer } from 'lucide-svelte';
	import { onMount } from 'svelte';
	let data: any;

	onMount(() => {
		console.log('Settings page loaded');
	});
</script>

<svelte:head>
	<title>Re:Forest :: View</title>
</svelte:head>
<page class="overflow-y-auto">
	<main class="mx-6 my-10 flex flex-col items-start gap-9">
		<article class="flex flex-col items-start self-stretch">
			<h1 class="text-2xl font-semibold">Settings</h1>
		</article>
		<optionsList class="flex w-full flex-col items-start gap-2">
			<MenuItem title="Profile">
				<svelte:fragment slot="start-icon">
					<Thermometer class="h-4 w-4" />
				</svelte:fragment>
				<ChevronRight class="h-4 w-4" />
			</MenuItem>
			<MenuItem title="Profile">
				<svelte:fragment slot="start-icon">
					<Thermometer class="h-4 w-4" />
				</svelte:fragment>
				<ChevronRight class="h-4 w-4" />
			</MenuItem>
		</optionsList>
		<article class="w-full pb-12 text-center text-sm font-light text-slate-600">
			It seems that you have reached the end.
		</article>
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
