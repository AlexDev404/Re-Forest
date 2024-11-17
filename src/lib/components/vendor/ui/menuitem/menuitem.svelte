<svelte:options customElement="menu-item" />

<script lang="ts">
	let { title = '' as string, onclick = (() => {}) as (event: MouseEvent | KeyboardEvent) => void } =
		$props();
</script>

<div
	{onclick}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') onclick(e);
	}}
	role="menuitem"
	tabindex="0"
	aria-expanded="false"
	class="flex w-full cursor-pointer items-center rounded-sm border border-slate-100 px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-foreground data-[highlighted]:bg-accent data-[state=open]:bg-accent"
>
	<div class="flex items-center space-x-2">
		<icon class="ml-auto">
			<slot name="start-icon" />
		</icon>

		<span>{title}</span>
	</div>
	<icon class="ml-auto">
		<slot />
	</icon>
</div>
