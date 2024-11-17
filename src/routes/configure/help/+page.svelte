<script lang="ts">
	import { Label } from '$lib/components/vendor/ui/label/index';
	import MenuItem from '$lib/components/vendor/ui/menuitem/menuitem.svelte';
	import { Switch } from '$lib/components/vendor/ui/switch/index';
	import { ChevronRight, HelpCircle, Map, Thermometer } from 'lucide-svelte';
	import { onMount } from 'svelte';
	let Units: Switch;
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
	<title>Re:Forest :: Settings</title>
</svelte:head>
<page class="overflow-y-auto">
	<main class="mx-6 my-10 flex min-h-[80vh] flex-col items-start gap-9">
		<article class="flex flex-col items-start self-stretch">
            <h1 class="text-2xl font-semibold">Settings &gt; Help</h1>
            <br>
            <h2 class="text 2x1 font-semibold items-start self stretch">Who are we? </h2>
            <p>We are a group of students from the University of Belize. We are currently studying information Technology and we are in our fisrt year of our Bachelor Program. We are working on a project called Re:Forest, which is a web application that aims to help users to plant trees and to learn more about the environment. </p>
            <br>
            <h2 class="text 2x1 font-semibold items-start self stretch">How to use this app?</h2>
            <p>When you first open the app, you will be taken to the home page. Here you can see the map of the world with all the trees that have been planted. You can click on the trees to see more information about them. You can also use the search bar to search for a specific tree. </p>
		</article>
	

	
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
