<script lang="ts">
	import { cn, flyAndScale } from "$lib/components/vendor/shadcn/utils";
	import { Menubar as MenubarPrimitive } from "bits-ui";

	type $$Props = MenubarPrimitive.SubContentProps;
	let className: $$Props["class"] = undefined;
	export let transition: $$Props["transition"] = flyAndScale;
	export let transitionConfig: $$Props["transitionConfig"] = {
		x: -10,
		y: 0,
	};
	export { className as class };
</script>

<MenubarPrimitive.SubContent
	{transition}
	{transitionConfig}
	class={cn(
		"bg-popover text-popover-foreground z-50 min-w-max rounded-md border p-1 shadow-lg focus:outline-none",
		className
	)}
	{...$$restProps}
>
	<slot />
</MenubarPrimitive.SubContent>
