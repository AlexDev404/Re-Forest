<script lang="ts">
	import { cn } from '$lib/components/vendor/shadcn/utils.js';
	import { Command as CommandPrimitive } from 'cmdk-sv';

	type $$Props = CommandPrimitive.ItemProps;


	let className: string | undefined | null = undefined;
	export { className as class };
</script>

<div
	class={cn(
		'relative flex cursor-default hover:bg-accent focus:bg-accent select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		className
	)}
	{...$$restProps}
>
	<slot/>
</div>
