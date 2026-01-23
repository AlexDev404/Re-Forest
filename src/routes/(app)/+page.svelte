<script lang="ts">
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Greening Belize :: Home</title>
</svelte:head>

<page
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary via-[#418e6c] to-primary"
>
	<!-- Background Pattern -->
	<div class="-z-1 absolute inset-0">
		<img
			src="/Greening Belize_Wallpaper_Base_Pattern_Transparent_Background.png"
			alt="Greening Belize Background Pattern"
			class="h-full w-full object-cover"
			width="10px"
		/>
	</div>

	<main class="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
		<!-- Logo -->
		<div class="mb-8">
			<img
				src="/static/assets/splash/logos/Forest_Green.png"
				alt="Greening Belize"
				class="w-40 drop-shadow-2xl sm:w-80 md:w-96"
			/>
		</div>

		<!-- Main Content -->
		<div class="mb-12 max-w-2xl text-center">
			<!-- CTA Button -->
			<div class="mb-16">
				<a
					href="/manage/add"
					class="mb-32 inline-flex items-center rounded-full bg-primary px-8 py-4
					text-lg font-semibold text-white shadow-sm transition-all duration-300
					hover:scale-105 hover:bg-accent"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="mr-2"
					>
						<path d="M12 2v20M2 12h20" />
					</svg>
					Plant a Tree
				</a>
			</div>
			<div class="CTA_MORE_INFO rounded-xl relative px-4 pt-8 flex flex-col gap-8 overflow-clip">
				<div
					class="absolute inset-0 bg-[url('/static/assets/splash/wallpapers/Gradient.png')] bg-cover bg-center opacity-40"
				></div>
				<p class="mb-6 text-xl drop-shadow sm:text-2xl">
					Greening Belize:<br/>A <b>Million</b> Trees for Climate and Sustainable Development
				</p>
				<p class="text-base drop-shadow sm:text-lg">
					Join us in our mission to restore and protect Belize's forests. Track your tree plantings
					and contribute to national reforestation efforts.
				</p>

				<!-- Partner Logos -->
				<div class="mb-16 rounded-2xl border-2 border-primary p-4 backdrop-blur-sm">
					<p class="mb-4 text-center text-lg font-semibold text-primary">In Partnership With</p>
					<div class="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
						<img src="/MSDCCSWM.png" alt="MSDCCSWM" class="h-12 object-contain sm:h-16" />
						<img src="/FD.png" alt="Forestry Department" class="h-12 object-contain sm:h-16" />
						<img src="/GEF.png" alt="GEF" class="h-12 object-contain sm:h-16" />
						<img src="/UNDP-Logo-Blue-Large.png" alt="UNDP" class="h-12 object-contain sm:h-16" />
					</div>
				</div>
			</div>
		</div>
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
