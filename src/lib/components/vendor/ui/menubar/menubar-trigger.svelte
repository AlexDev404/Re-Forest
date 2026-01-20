<script lang="ts">
	import { cn } from '$lib/components/vendor/shadcn/utils.js';
	import { Menubar as MenubarPrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: MenubarPrimitive.TriggerProps = $props();
</script>

<MenubarPrimitive.Trigger
	bind:ref
	class={cn(
		'flex cursor-default select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none focus:bg-secondary focus:text-accent-foreground data-[state=open]:bg-secondary data-[state=open]:text-accent-foreground',
		className
	)}
	{...restProps}
/>
