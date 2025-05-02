<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/vendor/ui/button';
	import IconCard from '$lib/components/vendor/ui/icon-card/icon-card.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	

	export let data: PageData;

	console.log(data); 

	const trees = data.trees;

	function confirmDelete(event: SubmitEvent) {
	const form = event.currentTarget as HTMLFormElement;
	const confirmed = confirm("Are you sure you want to delete this tree?");
	if (confirmed) form.submit();
	}


</script>


<svelte:head>
	<title>Re:Forest :: Manage Trees</title>
</svelte:head>

<page class="block h-fit overflow-y-auto pb-20">
	<main class="mx-6 my-10 flex flex-col items-start gap-12">
		<article class="flex items-start self-stretch">
			<div class="flex w-full items-center justify-between">
				<h1 class="text-2xl font-semibold">Manage Trees</h1>
				<a href="/manage/add"><Button>Add Tree</Button></a>
			</div>
		</article>
		{#if trees.length > 0}
		{#each trees as tree}
		<IconCard
		  avatarSrc={tree.Image ?? '/static/tree-placeholder.svg'}
		  avatarFallback="🌳"
		  title={tree.TreeName}
		  description={`Planted by: ${tree.PlantedBy ?? 'Unknown'}`}
		>
		<svelte:fragment slot="content">
			<form method="POST" on:submit|preventDefault={confirmDelete} action="?/delete">
			  <input type="hidden" name="treeId" value={tree.Id} />
			  <Button variant="destructive" name="delete" type="submit">Delete</Button>
			</form>
		  </svelte:fragment>
		  
		</IconCard>
	  {/each}
{:else}
  <p>No trees found.</p>
{/if}
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>