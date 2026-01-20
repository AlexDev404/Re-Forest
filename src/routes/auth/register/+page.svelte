<script lang="ts">
	import { PUBLIC_DEEP_DEBUG } from '$env/static/public';
	import { Button } from '$lib/components/vendor/ui/button/index.js';
	import { Input } from '$lib/components/vendor/ui/input/index.js';
	import { Label } from '$lib/components/vendor/ui/label/index.js';
	import SuperDebug from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	// Initialize the form
	const { form, errors, constraints, enhance, message } = superForm(data.form);
</script>

<svelte:head>
	<title>Greening Belize :: Register an account</title>
</svelte:head>
<page class="overflow-y-auto pb-20">
	{#if JSON.parse(PUBLIC_DEEP_DEBUG)}
		<SuperDebug data={$form} />
	{/if}
	<main class="mx-6 my-10 flex min-h-[80vh] flex-col items-center justify-center gap-9">
		<div class="flex items-center justify-center gap-4 self-stretch">
			<!-- Logo -->
			<logo>
				<img
					src="/static/assets/banner/Forest_Green.png"
					alt="Greening Belize Logo"
					class="object-contain"
					width="200px"
				/>
			</logo>
			<!-- <h1 class="text-4xl font-bold text-primary">Greening Belize</h1> -->
		</div>
		<!-- Registration form -->
		<form method="POST" use:enhance class="flex w-full flex-col gap-5 lg:px-12">
			<div class="grid w-full items-center gap-1.5">
				<Label for="name" class="w-fit">Full Name</Label>
				<p class="text-sm text-destructive">{$errors.name}</p>
				<Input
					type="text"
					bind:value={$form.name}
					name="name"
					placeholder="Enter your full name"
					class="w-full"
					{...$constraints.name}
				/>
			</div>
			<div class="grid w-full items-center gap-1.5">
				<Label for="email" class="w-fit">Email</Label>
				<p class="text-sm text-destructive">{$errors.email}</p>
				<Input
					type="email"
					bind:value={$form.email}
					name="email"
					placeholder="Enter your email"
					class="w-full"
					{...$constraints.email}
				/>
			</div>
			<div class="grid w-full items-center gap-1.5">
				<Label for="password" class="w-fit">Password</Label>
				<p class="text-sm text-destructive">{$errors.password}</p>
				<Input
					type="password"
					bind:value={$form.password}
					name="password"
					placeholder="Create a password"
					class="w-full"
					{...$constraints.password}
				/>
			</div>
			<div class="grid w-full items-center gap-1.5">
				<Label for="confirmPassword" class="w-fit">Confirm Password</Label>
				<p class="text-sm text-destructive">{$errors.confirmPassword}</p>
				<Input
					type="password"
					bind:value={$form.confirmPassword}
					name="confirmPassword"
					placeholder="Confirm your password"
					class="w-full"
					{...$constraints.confirmPassword}
				/>
			</div>
			<p class="text-sm text-destructive">{$errors._errors}</p>
			<p class="text-sm text-green-400">{$message}</p>
			<div class="flex flex-col gap-4">
				<Button type="submit" class="w-full">Create Account</Button>
				<div class="flex w-full items-center justify-center">
					<a href="/auth/login" class="text-sm text-primary">Already have an account? Log in</a>
				</div>
			</div>
		</form>
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
