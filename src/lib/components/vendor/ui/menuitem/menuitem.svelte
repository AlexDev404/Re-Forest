<script lang="ts">
	export let title: string;
</script>

<div
	role="menuitem"
	tabindex="-1"
	aria-expanded="false"
	class="flex w-full cursor-pointer items-center rounded-sm border border-slate-100 px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-foreground data-[highlighted]:bg-accent data-[state=open]:bg-accent"
>
	<div class="flex items-center space-x-2">
		<icon class="ml-auto">
			<slot name="start-icon"/>
		</icon>

		<span>{title}</span>
	</div>
	<icon class="ml-auto">
		<slot />
	</icon>
</div>
