<script lang="ts">
	import { Button } from '$lib/components/vendor/ui/button';
	import { formatDate } from '$lib/utility/utility';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	console.log(data);

	const trees = data.trees;

	function confirmDelete(event: SubmitEvent) {
		const form = event.currentTarget as HTMLFormElement;
		const confirmed = confirm('Are you sure you want to delete this tree?');
		if (confirmed) form.submit();
	}
</script>

<svelte:head>
	<title>Re:Forest :: Manage Tree Assets</title>
</svelte:head>

<page class="block min-h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-y-auto pb-24">
	<main class="mx-auto w-full max-w-4xl px-4 sm:px-6 py-10 sm:py-16 flex flex-col gap-10">
		<header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8">
			<div>
				<h1 class="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
					Manage Tree Assets
				</h1>
				<p class="text-sm text-muted-foreground mt-1">
					View, update, or remove existing tree asset records.
				</p>
			</div>
			<a href="/manage/add">
				<Button class="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md px-5 py-2.5 text-sm shadow hover:shadow-md transition-all duration-200 ease-out flex items-center justify-center gap-2 group">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1 group-hover:scale-110 transition-transform"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
					Register New Asset
			</Button>
			</a>
		</header>

		{#if trees.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
				{#each trees as tree}
					<div class="bg-card shadow rounded-xl border border-border p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200 ease-out">
						<div class="flex items-center gap-4">
							<img 
								src={tree.Image ?? '/static/images/pine-tree.jpg'} 
								alt={tree.TreeName ?? 'Tree image'} 
								class="w-16 h-16 rounded-lg object-cover border border-border shadow-sm"
								onerror={(e) => {
									e.currentTarget.onerror = null; 
									e.currentTarget.src = '/static/images/pine-tree.jpg';
								}}
							/>
							<div>
								<h2 class="text-base font-semibold text-foreground leading-tight">{tree.TreeName}</h2>
								<p class="text-xs text-muted-foreground mt-0.5">
									ID: {tree.Id} 
								</p>
							</div>
						</div>
						<div class="text-xs text-muted-foreground space-y-1.5 pt-2 border-t border-border mt-auto">
							<p><strong>Age:</strong> {tree.Age ?? 'N/A'} years</p>
							<p><strong>Height:</strong> {tree.Height ?? 'N/A'}m</p>
							<p>
								<strong>Planted:</strong> 
								{tree.PlantedBy !== null && !('message' in tree.PlantedBy && 'name' in tree.PlantedBy)
									? `${tree.PlantedBy.FirstName} ${tree.PlantedBy.LastName}`
									: 'Deleted User'}
								on {formatDate(tree.PlantedOn ?? '')}
							</p>
						</div>
						<div class="mt-4 pt-4 border-t border-border flex items-center gap-2">
							<!-- <Button variant="outline" size="sm" class="text-xs flex-1 shadow-sm">
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
								View Details
							</Button> -->
							<form
								method="POST"
								onsubmit={(event) => {
									event.preventDefault();
									confirmDelete(event);
								}}
								action="?/delete"
								class="flex-1"
							>
								<input type="hidden" name="treeId" value={tree.Id} />
								<Button variant="destructive" size="sm" name="delete" type="submit" class="text-xs w-full shadow-sm">
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
									Delete
								</Button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="w-full bg-card shadow rounded-xl border border-border p-10 text-center flex flex-col items-center gap-4">
				<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground/70 mb-2"><path d="M10 10.5A2.5 2.5 0 1 0 7.5 8M10 10.5A2.5 2.5 0 1 1 12.5 8M10 10.5V17.5M10 17.5A2.5 2.5 0 1 0 7.5 20M10 17.5A2.5 2.5 0 1 1 12.5 20M5 22H19C19.5523 22 20 21.5523 20 21V10C20 5.02944 15.9706 1 11 1C6.02944 1 2 5.02944 2 10V21C2 21.5523 2.44772 22 3 22"></path></svg>
				<h3 class="text-lg font-medium text-foreground">No Tree Assets Found</h3>
				<p class="text-sm text-muted-foreground max-w-md">
					It looks like there are no tree assets registered in the system yet. 
					You can start by adding a new asset.
				</p>
				<a href="/manage/add" class="mt-2">
					<Button class="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md px-5 py-2.5 text-sm shadow hover:shadow-md transition-all duration-200 ease-out flex items-center justify-center gap-2 group">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1 group-hover:scale-110 transition-transform"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
						Register First Asset
					</Button>
				</a>
			</div>
		{/if}
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
