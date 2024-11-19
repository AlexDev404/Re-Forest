<script lang="ts">
	import * as Avatar from '$lib/components/vendor/ui/avatar';
	import * as Dialog from '$lib/components/vendor/ui/dialog';
	let src: string;
	export { src as avatarSrc };
	export let avatarFallback: string;
	export let title: string;
	export let description: string;
	export let dialog_title: string = '';
	export let dialog_description: string = '';

	export let wants_dialog: boolean = false;
	export let srcImg: string | null = null;
	export let srcImgAlt: string | undefined = undefined;
	export let srcImagePlaceholderText: string = 'No image available';
	export let wants_image: boolean = false;
</script>

<Dialog.Root>
	<div class="flex w-full flex-col space-y-2">
		<div class="w-full rounded-md bg-secondary px-6 py-5">
			<div class="flex justify-start space-x-8">
				<Avatar.Root>
					<Avatar.Image {src} />
					<Avatar.Fallback>{avatarFallback}</Avatar.Fallback>
				</Avatar.Root>
				<div class="space-y-1">
					<h4 class="text-sm font-semibold">{title}</h4>
					<p class="text-sm">{description}</p>
					<div class="flex items-center pt-2">
						<slot name="content" />
					</div>
				</div>
			</div>
			<slot name="content1" />
			{#if wants_dialog}
				<Dialog.Trigger class="w-full"><slot name="dialog-trigger" /></Dialog.Trigger>
			{/if}
		</div>
		{#if wants_image}
			<div class="flex h-48 w-full items-center justify-center rounded-md bg-secondary px-6 py-5">
				{#if srcImg}
					<img src={srcImg} alt={srcImgAlt} class="h-full w-full rounded-sm object-cover" />
				{:else}
					<div
						class="flex h-full w-full items-center justify-center rounded-sm border border-dotted border-slate-400 text-center"
					>
						<span class="font-light">{@html srcImagePlaceholderText}</span>
					</div>
				{/if}
			</div>
		{/if}
	</div>
	<Dialog.Content class="rounded-lg sm:max-w-[275px]" id="add-tree">
		<Dialog.Header>
			<Dialog.Title>{dialog_title}</Dialog.Title>
			<Dialog.Description>
				{dialog_description}
			</Dialog.Description>
		</Dialog.Header>
		<slot name="dialog-content" />
		<Dialog.Footer>
			<slot name="dialog-footer" />
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
