<script lang="ts">
	import { onMount } from 'svelte';
	import { CheckCircle2, Home, Leaf } from 'lucide-svelte';
	import { Button } from '$lib/components/vendor/ui/button';
	
	let treeId = $state<string | null>(null);
	
	onMount(() => {
		// Get tree ID from URL query params
		const params = new URLSearchParams(window.location.search);
		treeId = params.get('tree_id');
	});
</script>

<svelte:head>
	<title>Greening Belize :: Tree Submitted</title>
</svelte:head>

<page class="block min-h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-y-auto">
	<main class="mx-auto w-full max-w-2xl px-4 sm:px-6 py-16 flex flex-col items-center gap-8">
		<div class="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
			<CheckCircle2 class="w-12 h-12 text-green-600 dark:text-green-400" />
		</div>
		
		<div class="text-center">
			<h1 class="text-3xl sm:text-4xl font-bold text-foreground mb-4">
				Tree Submitted Successfully!
			</h1>
			<p class="text-lg text-muted-foreground mb-2">
				Thank you for contributing to Greening Belize.
			</p>
			<p class="text-sm text-muted-foreground">
				Your tree planting has been recorded and is pending approval.
			</p>
		</div>

		{#if treeId}
		<div class="bg-card border border-border rounded-lg p-6 w-full">
			<div class="flex items-center gap-3 mb-2">
				<Leaf class="w-5 h-5 text-primary" />
				<p class="text-sm font-medium text-foreground">Submission ID</p>
			</div>
			<p class="text-2xl font-mono font-bold text-primary">#{treeId}</p>
		</div>
		{/if}

		<div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
			<Button 
				onclick={() => window.location.href = '/manage/add'}
				class="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
			>
				<Leaf class="mr-2 h-4 w-4" />
				Add Another Tree
			</Button>
			<Button 
				onclick={() => window.location.href = '/'}
				variant="outline"
				class="w-full sm:w-auto"
			>
				<Home class="mr-2 h-4 w-4" />
				Return Home
			</Button>
		</div>

		<div class="mt-8 text-center">
			<p class="text-xs text-muted-foreground">
				Your submission will be reviewed by the Forestry Department.
			</p>
		</div>
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
