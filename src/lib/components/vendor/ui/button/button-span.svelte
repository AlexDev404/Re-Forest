<script lang="ts">
	import { cn } from '$lib/components/vendor/shadcn/utils';
	export let href: string | undefined = undefined;
	let className: string | undefined = undefined;
	export { className as class };
</script>

<a
	{href}
	{...$$restProps}
	class={cn(
		'inline-flex h-9 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&[data-disabled="true"]]:pointer-events-none [&[data-disabled="true"]]:select-none [&[data-disabled="true"]]:opacity-50',
		className
	)}
>
	<slot />
</a>
