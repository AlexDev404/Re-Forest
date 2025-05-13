<script lang="ts">
	const { children } = $props();
</script>

<section class="h-full w-full pb-16">
	{@render children?.()}
</section>
