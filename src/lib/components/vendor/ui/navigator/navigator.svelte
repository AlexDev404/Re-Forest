<script lang="ts">
	import { cn } from '$lib/components/vendor/shadcn/utils';
	import { Menubar as MenubarPrimitive } from 'bits-ui';

	let { class: className = undefined as string | undefined, ...rest } = $props();
</script>

<MenubarPrimitive.Root
	class={cn(
		'flex h-fit items-center justify-between self-stretch rounded-md border bg-primary p-1 text-background shadow-sm lg:justify-center lg:space-x-1',
		className
	)}
	{...rest}
>
	<slot />
</MenubarPrimitive.Root>
