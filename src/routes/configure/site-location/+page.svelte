<script lang="ts">
	import Button from '$lib/components/vendor/ui/button/button.svelte';
	import Input from '$lib/components/vendor/ui/input/input.svelte';
	import { Label } from '$lib/components/vendor/ui/label';
	import MenuItem from '$lib/components/vendor/ui/menuitem/menuitem.svelte';
	import { Map } from 'lucide-svelte';
	import { onMount } from 'svelte';
	let checked: boolean;
	onMount(() => {
		let unitcheck: boolean = JSON.parse(localStorage.getItem('units') ?? 'false');
		if (unitcheck) {
			checked = unitcheck;

			console.log(checked);
		}
	});
</script>

<svelte:head>
	<title>Re:Forest :: Settings ::&gt; Site Location</title>
</svelte:head>
<page class="overflow-y-auto">
	<main class="mx-6 my-10 flex min-h-[80vh] flex-col items-start gap-9">
		<div class="flex flex-col items-start self-stretch">
			<h1 class="text-2xl font-semibold">
				<a href="/configure">Settings</a> <span> &gt; Site Location</span>
			</h1>
			<br />
			<div class="flex w-full flex-col items-start space-y-14">
				<div class="flex w-full flex-col items-center space-y-4">
					<div class="w-full rounded-sm border border-slate-100 px-2 pb-2">
						<MenuItem title="Site Location" class="border-0 px-0">
							<svelte:fragment slot="start-icon">
								<Map class="h-4 w-4" />
							</svelte:fragment>
						</MenuItem>
						<p class="text-xs font-light">Currently set to: <b>LOCATION_NAME</b></p>
					</div>
					<Button class="w-full">Grab my current location</Button>
				</div>
				<div class="grid w-full max-w-sm items-center gap-1.5">
					<Label for="location">Custom Location</Label>
					<Input id="location" type="text" placeholder="Type in a location" />
				</div>
			</div>
		</div>
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
