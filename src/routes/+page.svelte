<script lang="ts">
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Greening Belize :: Home</title>
</svelte:head>

<page class="min-h-screen bg-gradient-to-br from-[#016937] via-[#418e6c] to-[#016937] relative overflow-hidden">
	<!-- Background Pattern -->
	<div class="absolute inset-0 opacity-10">
		<img src="/Greening Belize_Wallpaper_Base_Pattern_Transparent_Background.png" alt="" class="w-full h-full object-cover" />
	</div>

	<main class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
		<!-- Logo -->
		<div class="mb-8">
			<img 
				src="/Greening Belize Forest Green_OPTION_1.png" 
				alt="Greening Belize" 
				class="w-64 sm:w-80 md:w-96 drop-shadow-2xl"
			/>
		</div>

		<!-- Main Content -->
		<div class="text-center mb-12 max-w-2xl">
			<h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
				Greening Belize
			</h1>
			<p class="text-xl sm:text-2xl text-white/90 mb-6 drop-shadow">
				Tree Planting Tracking for a Sustainable Future
			</p>
			<p class="text-base sm:text-lg text-white/80 drop-shadow">
				Join us in our mission to restore and protect Belize's forests. 
				Track your tree plantings and contribute to national reforestation efforts.
			</p>
		</div>

		<!-- CTA Button -->
		<div class="mb-16">
			<a 
				href="/manage/add" 
				class="inline-flex items-center px-8 py-4 bg-white text-[#016937] rounded-full text-lg font-semibold hover:bg-[#dbd5a4] hover:scale-105 transition-all duration-300 shadow-2xl"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
					<path d="M12 2v20M2 12h20"/>
				</svg>
				Plant a Tree
			</a>
		</div>

		<!-- Partner Logos -->
		<div class="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl">
			<p class="text-center text-sm text-gray-600 mb-4 font-medium">
				In Partnership With
			</p>
			<div class="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
				<img src="/MSDCCSWM.png" alt="MSDCCSWM" class="h-12 sm:h-16 object-contain" />
				<img src="/FD.png" alt="Forestry Department" class="h-12 sm:h-16 object-contain" />
				<img src="/GEF.png" alt="GEF" class="h-12 sm:h-16 object-contain" />
				<img src="/UNDP-Logo-Blue-Large.png" alt="UNDP" class="h-12 sm:h-16 object-contain" />
			</div>
		</div>
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
