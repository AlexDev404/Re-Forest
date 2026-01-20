<script lang="ts">
	import { afterNavigate, beforeNavigate, onNavigate } from '$app/navigation';
	import { Button } from '$lib/components/vendor/ui/button';
	import { requestNotificationPermission } from '$lib/firebase';
	import type { OnNavigate } from '@sveltejs/kit';
	import { CircleX } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	import type { PageProps } from './$types';
	const { data }: PageProps = $props();

	let loadingBar: HTMLDivElement;
	let mobile: boolean = $state(false);

	function delayNavigation(navigation: OnNavigate) {
		if (!document.startViewTransition) return new Promise((res) => setTimeout(res, 500));

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve(void 0);
				await navigation.complete;
			});
		});
	}

	onNavigate(async (navigation) => {
		// do some work immediately before the navigation completes

		// optionally return a promise to delay navigation until it resolves
		await delayNavigation(navigation);
	});

	beforeNavigate(() => {
		loadingBar.style.opacity = '1';
	});

	afterNavigate(() => {
		setTimeout(() => {
			loadingBar.classList.add('animate-fade-out');
		}, 1115);
		setTimeout(() => {
			loadingBar.style.opacity = '0';
			loadingBar.classList.remove('animate-fade-out');
		}, 1125);
	});

	onMount(() => {
		loadingBar.style.opacity = '0';
		const splashScreen = document.getElementById('splash-screen');
		setTimeout(() => {
			splashScreen?.classList.add('animate-fade-out');
		}, 1000);
		setTimeout(() => {
			splashScreen?.remove();
		}, 2000);
	});

	onMount(() => {
		loadingBar.style.opacity = '0';
		const splashScreen = document.getElementById('splash-screen');
		setTimeout(() => {
			splashScreen?.classList.add('animate-fade-out');
		}, 1000);
		setTimeout(() => {
			splashScreen?.remove();
		}, 2000);

		// Register Firebase service worker
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/firebase-messaging-sw.js')
				.then((registration) => {
					console.log('Firebase service worker registered with scope:', registration.scope);
				})
				.catch((error) => {
					console.error('Service worker registration failed:', error);
				});
		}

		// Request notification permission
		requestNotificationPermission()
			.then((permission) => {
				if (permission === 'granted') {
					console.log('Notification permission granted.');
				} else if (permission === 'denied') {
					console.log('Notification permission denied.');
				} else {
					console.log('Notification permission dismissed.');
				}
			})
			.catch((error) => {
				console.error('Error requesting notification permission:', error);
			});
	});

	onMount(() => {
		if (typeof window !== 'undefined') {
			mobile = window.localStorage.getItem('mobile') === 'true';
		}
	});
</script>

<app class="h-full w-full">
	<div
		bind:this={loadingBar}
		class="loading-bar overflow-clip"
		style="height: 3px; width: 100%; position: fixed; top: 0; right: 0; opacity: 0; z-index: 1000"
	>
		<div style="height: 3px; animation: loading2 3s ease-out 1" class="loading-gradient-2">
			<div
				style="height: 3px; animation: loading 3s ease-out infinite"
				class="loading-gradient w-full origin-right delay-0 duration-1000 ease-linear"
			></div>
		</div>
	</div>
	<content class="block {mobile ? '' : 'lg:hidden'}"><slot /></content>

	<content class="hidden {mobile ? '' : 'lg:block'}">
		<div class="flex h-screen w-full items-center justify-center">
			<div class="max-w-md p-8 text-center">
				<CircleX size={48} class="mx-auto mb-4" />
				<h1 class="mb-2 text-2xl font-bold">Nope!</h1>
				<p class="text-gray-600">
					This app is designed for mobile devices. Please use a mobile device or open the device
					emulator in your browser.
				</p>
				<Button
					class="mt-4"
					onclick={() => {
						window.localStorage.setItem('mobile', 'true');
						window.location.reload();
					}}
					color="primary"
					size="lg">Whatever</Button
				>
			</div>
		</div>
	</content>
</app>
