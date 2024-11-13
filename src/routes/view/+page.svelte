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
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (diffDays) {
            case 0:
                oldDate = 'Today';
                return 'Today';
            case 1:
                oldDate = 'Yesterday';
                return 'Yesterday';
            case 2:
                oldDate = 'Two Days Ago';
                return 'Two Days Ago';
            case 2:
                oldDate = 'Three Days Ago';
                return 'Three Days Ago';
            case 7:
                oldDate = 'Last Week';
                return 'Last Week';
            case 14:
                oldDate = 'Two Weeks Ago';
                return 'Two Weeks Ago';
            default:
                oldDate = formattedDate;
                return formattedDate;
        }
    };
</script>

<page class="overflow-y-auto">
	<main class="mx-6 my-10 flex flex-col items-start gap-12">
		{#each trees as tree, index}
            {#if oldDate !== getRelativeDay(tree)}
                <article class="flex items-start self-stretch">
                    <h1 class="text-2xl font-semibold">{getRelativeDay(tree)}</h1>
                </article>
            {/if}

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
	</main>
</page>

<style>
    :global(body) {
        overflow: auto;
    }
</style>