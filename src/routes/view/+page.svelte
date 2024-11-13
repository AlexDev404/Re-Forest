<script lang="ts">
	import IconCard from '$lib/components/vendor/ui/icon-card/icon-card.svelte';
	import TreeData from '$lib/data/trees.json';
	import { type Tree } from '$lib/types/Tree';
	import { Calendar } from 'lucide-svelte';
	const trees: Tree[] = TreeData;
	let oldDate: string;

	const getRelativeDay = (tree: Tree) => {
		const today = new Date();
		const plantedDate = new Date(tree.plantedOn);

		const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
		const formattedDate = plantedDate.toLocaleDateString(undefined, options);

		const diffTime = today.getTime() - plantedDate.getTime();
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

<page class="overflow-y-auto">
	<main class="mx-6 my-10 flex flex-col items-start gap-12">
		{#each trees as tree, index}
			{@html getRelativeDay(tree)}

			<IconCard
				avatarSrc="/static/tree.svg"
				avatarFallback="SK"
				title={tree.name}
				description={`Planted by: ${tree.plantedBy}`}
			>
				<svelte:fragment slot="content">
					<Calendar class="mr-2 h-4 w-4 opacity-70" />
					<span class="text-xs text-muted-foreground">Planted on <b>{tree.plantedOn} </b></span>
				</svelte:fragment>
			</IconCard>
		{/each}
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
