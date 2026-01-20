import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
	plugins: [
		ViteImageOptimizer({
			/* pass your config */
		}),
		sveltekit()
	],

	test: {
		workspace: [
			{
				extends: './vite.config.ts',
				plugins: [svelteTesting()],

				test: {
					name: 'client',
					environment: 'jsdom',
					clearMocks: true,
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',

				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		],
		coverage: {
			provider: 'istanbul' // or 'v8'
		}
	},
	server: {
		allowedHosts: ['sveltekit.alexdev404.localplayer.dev']
	},
	preview: {
		cors: {
			origin: /^https?:\/\/sveltekit\.alexdev404\.localplayer\.dev(?::\d+)?$/
		}
	}
});
