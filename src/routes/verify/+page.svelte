<script lang="ts">
	import type { Tree } from '$lib/class/Tree';
	import { Button } from '$lib/components/vendor/ui/button';
	import IconCard from '$lib/components/vendor/ui/icon-card/icon-card.svelte';
	import { Calendar, CheckCircle, XCircle } from 'lucide-svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	let pendingTrees: Tree[] = $state(data.pendingTrees);
	let oldDate: string;
	let loading = $state(false);

	async function handleVerifyTree(treeId: number, approved: boolean) {
		loading = true;
		try {
			const formData = new FormData();
			formData.append('tree_id', treeId.toString());
			formData.append('approved', approved.toString());

			const response = await fetch('?/verify', {
				method: 'POST',
				body: formData
			});

			const res = await response.json();
			const result = JSON.parse(res.data)[0];

			if (result.success) {
				// Remove the tree from the list after successful verification
				pendingTrees = pendingTrees.filter((tree) => tree.Id !== treeId);
			} else {
				console.error('Verification failed:', result.message);
			}
		} catch (error) {
			console.error('Error verifying tree:', error);
		} finally {
			loading = false;
		}
	}

	const getRelativeDay = (tree: Tree) => {
		if (!tree.CreatedAt) return '';

		const today = new Date();
		const createdDate = new Date(tree.CreatedAt);

		const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
		const formattedDate = createdDate.toLocaleDateString(undefined, options);

		const diffTime = today.getTime() - createdDate.getTime();
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		let relativeDay = '';

		if (diffDays === 0) {
			relativeDay = 'Today';
		} else if (diffDays === 1) {
			relativeDay = 'Yesterday';
		} else if (diffDays === 2) {
			relativeDay = 'Two Days Ago';
		} else if (diffDays === 3) {
			relativeDay = 'Three Days Ago';
		} else if (diffDays === 7) {
			relativeDay = 'Last Week';
		} else if (diffDays === 14) {
			relativeDay = 'Two Weeks Ago';
		} else {
			relativeDay = formattedDate;
		}

		if (oldDate !== relativeDay) {
			oldDate = relativeDay;
			return `<article class="flex items-start self-stretch"><h1 class="text-2xl font-semibold">${relativeDay}</h1></article>`;
		}

		return '';
	};
</script>

<svelte:head>
	<title>Re:Forest :: Verify Trees</title>
</svelte:head>

<page class="overflow-y-auto">
	<main class="mx-6 my-10 flex flex-col items-start gap-12">
		<article class="flex items-start self-stretch">
			<div class="flex w-full items-center justify-between">
				<h1 class="text-2xl font-semibold">Verify Submissions</h1>
			</div>
		</article>

		{#if loading}
			<p class="w-full text-center">Processing your request...</p>
		{:else if pendingTrees.length === 0}
			<p class="w-full text-center">No pending tree submissions to verify.</p>
		{:else}
			{#each pendingTrees as tree, index}
				{@html getRelativeDay(tree)}

				<IconCard
					wants_image
					wants_dialog
					dialog_title="Verify Tree Submission"
					dialog_description="You cannot undo this."
					srcImgAlt="Tree image"
					srcImg={tree.Image}
					srcImagePlaceholderText="No image available"
					avatarSrc="/static/tree.svg"
					avatarFallback="🌲"
					title={tree.TreeName}
					description={`Planted by: ${typeof tree.PlantedBy === 'object' ? tree.PlantedBy.FirstName : ''} ${typeof tree.PlantedBy === 'object' ? tree.PlantedBy.LastName : ''}`}
				>
					<svelte:fragment slot="content">
						<Calendar class="mr-2 h-4 w-4 opacity-70" />
						<span class="text-xs text-muted-foreground">
							Planted on <b
								>{tree.PlantedOn
									? new Date(tree.PlantedOn).toLocaleDateString()
									: 'Unknown date'}</b
							>
						</span>
					</svelte:fragment>

					<svelte:fragment slot="dialog-trigger">
						<Button variant="outline" class="w-full">Verify</Button>
					</svelte:fragment>

					<svelte:fragment slot="content1">
						<div class="mt-4 flex gap-2">
							<div class="grid w-full gap-1.5">
								<div class="text-sm font-medium">
									Species ID: <span class="font-normal">{tree.TreeSpecies}</span>
								</div>
								<div class="text-sm font-medium">
									Height: <span class="font-normal">{tree.Height} meters</span>
								</div>
								<div class="text-sm font-medium">
									Age: <span class="font-normal">{tree.Age} years</span>
								</div>
								<div class="text-sm font-medium">
									Health: <span class="font-normal">{tree.Health}</span>
								</div>
								<div class="text-sm font-medium">
									Location: <span class="font-normal"
										>{tree.Lat.toFixed(6)}, {tree.Lng.toFixed(6)}</span
									>
								</div>
							</div>
						</div>
					</svelte:fragment>

					<svelte:fragment slot="dialog-footer">
						<div class="mt-4 flex w-full justify-between gap-4">
							<Button
								variant="destructive"
								class="flex-1"
								onclick={() => handleVerifyTree(tree.Id, false)}
								disabled={loading}
							>
								<XCircle class="mr-2 h-4 w-4" />
								Decline
							</Button>
							<Button
								variant="default"
								class="flex-1"
								onclick={() => handleVerifyTree(tree.Id, true)}
								disabled={loading}
							>
								<CheckCircle class="mr-2 h-4 w-4" />
								Approve
							</Button>
						</div>
					</svelte:fragment>
				</IconCard>
			{/each}
		{/if}

		{#if pendingTrees.length > 0}
			<article class="w-full pb-12 text-center text-sm font-light text-slate-600">
				No more pending submissions to verify.
			</article>
		{/if}
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
