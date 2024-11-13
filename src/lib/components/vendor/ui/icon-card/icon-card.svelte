<script lang="ts">
	import * as Avatar from '$lib/components/vendor/ui/avatar';
	let src: string;
	export { src as avatarSrc };
	export let avatarFallback: string;
	export let title: string;
	export let description: string;
</script>

<div class="w-full rounded-md bg-secondary px-6 py-5">
	<div class="flex justify-between space-x-4">
		<Avatar.Root>
			<Avatar.Image {src} />
			<Avatar.Fallback>{avatarFallback}</Avatar.Fallback>
		</Avatar.Root>
		<div class="space-y-1">
			<h4 class="text-sm font-semibold">{title}</h4>
			<p class="text-sm">{description}</p>
			<div class="flex items-center pt-2">
				<slot name="content"/>
			</div>
		</div>
	</div>
</div>
