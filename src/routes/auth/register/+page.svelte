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
	<title>Re:Forest :: Register an account</title>
</svelte:head>
<page class="overflow-y-auto pb-20">
	{#if JSON.parse(PUBLIC_DEEP_DEBUG)}
		<SuperDebug data={$form} />
	{/if}
	<main class="mx-6 my-10 flex min-h-[80vh] flex-col items-center justify-center gap-9">
		<div class="flex items-center justify-center gap-4 self-stretch">
			<!-- Logo -->
			<logo>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="46"
					height="62"
					viewBox="0 0 46 62"
					fill="none"
				>
					<path
						d="M45.3189 45.5929L35.7485 34.8122H39.4178C40.4972 34.8122 41.4519 34.2165 41.9072 33.2563C42.3624 32.2984 42.2126 31.2 41.5142 30.3911L32.1547 19.5627H35.6156C36.7057 19.5627 37.688 18.9254 38.1145 17.9413C38.5361 16.9727 38.3373 15.8457 37.6065 15.0725L24.3968 1.07632C23.6744 0.307892 22.3268 0.307892 21.6032 1.07632L8.39226 15.0725C7.66152 15.8457 7.46386 16.9727 7.88434 17.9413C8.3108 18.9254 9.29432 19.5627 10.3844 19.5627H13.8453L4.48457 30.3934C3.78856 31.2012 3.63882 32.2984 4.09284 33.2575C4.54806 34.2165 5.50163 34.8122 6.58217 34.8122H10.2515L0.681097 45.5929C-0.0376696 46.4018 -0.20059 47.5098 0.254629 48.4831C0.703858 49.4422 1.69216 50.0617 2.77151 50.0617H19.1666V52.9746L15.538 58.7408C14.9007 60.0084 15.8279 61.5 17.2523 61.5H28.7477C30.1721 61.5 31.0993 60.0084 30.462 58.7408L26.8334 52.9746V50.0617H43.2285C44.3078 50.0617 45.2961 49.4422 45.7454 48.4831C46.2006 47.5098 46.0377 46.4018 45.3189 45.5929Z"
						fill="#00630A"
					/>
				</svg>
			</logo>
			<h1 class="text-4xl font-bold text-primary">Re:Forest</h1>
		</div>
		<!-- Registration form -->
		<form method="POST" use:enhance class="flex w-full flex-col gap-8 lg:px-12">
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
			<Button type="submit" class="w-full">Create Account</Button>
			<div class="flex w-full items-center justify-center">
				<a href="/auth/login" class="text-sm text-primary underline"
					>Already have an account? Log in</a
				>
			</div>
		</form>
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
