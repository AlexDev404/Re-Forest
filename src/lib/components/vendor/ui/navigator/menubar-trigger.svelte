<script lang="ts">
	import { cn } from "$lib/components/vendor/shadcn/utils";
	import { Menubar as MenubarPrimitive } from "bits-ui";

	type $$Props = MenubarPrimitive.TriggerProps;
	type $$Events = MenubarPrimitive.TriggerEvents;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<MenubarPrimitive.Trigger
	class={cn(
		"focus:bg-accent flex cursor-default self-stretch select-none items-center rounded-sm px-3.5 py-2.5 text-sm font-medium outline-none",
		className
	)}
	{...$$restProps}
	on:click
	on:keydown
	on:pointerenter
>
	<slot />
</MenubarPrimitive.Trigger>
