<script lang="ts">
	import IconCard from '$lib/components/vendor/ui/icon-card/icon-card.svelte';
	import { Calendar } from 'lucide-svelte';
	import { onMount } from 'svelte';

	onMount(() => {});
</script>

<page>
	<main class="mx-6 my-10 flex flex-col items-start gap-12">
		<article class="flex items-start self-stretch">
			<h1 class="text-3xl font-semibold">Today</h1>
		</article>

		<IconCard
			avatarSrc="https://github.com/sveltejs.png"
			avatarFallback="SK"
			title="@sveltejs"
			description="Cybernetically enhanced web apps"
		>
			<div slot="content">
				<Calendar class="mr-2 h-4 w-4 opacity-70" />
				<span class="text-xs text-muted-foreground"> Joined September 2022 </span>
			</div>
		</IconCard>
	</main>
</page>
