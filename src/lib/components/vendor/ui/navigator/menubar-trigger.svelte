<script lang="ts">
	import { cn } from '$lib/components/vendor/shadcn/utils';
	import { Menubar as MenubarPrimitive } from 'bits-ui';

	let { class: className = undefined as string | undefined, ...rest } = $props();
</script>

<MenubarPrimitive.Trigger
	class={cn(
		'flex cursor-default select-none items-center self-stretch rounded-sm px-3.5 py-2.5 text-sm font-medium outline-none focus:bg-secondary',
		className
	)}
	{...rest}
>
	<slot />
</MenubarPrimitive.Trigger>
