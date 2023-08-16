import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import inject from '@rollup/plugin-inject';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		target: 'es2020',
		rollupOptions: {
			// Polyfill Buffer for production build
			plugins: [
				inject({
					modules: {Buffer: ['buffer', 'Buffer']}
				})
			]
		}
	},
	optimizeDeps: {
		esbuildOptions: {
			// Node.js global to browser globalThis
			define: {
				global: 'globalThis'
			},
		}
	}
});