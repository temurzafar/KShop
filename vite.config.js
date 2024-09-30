import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: resolve(__dirname, 'assets/js/input.js'),
            output: {
                entryFileNames: 'main.js',
                format: 'es',
            },
        },
        outDir: dirname('assets/js/*'),
        emptyOutDir: false,
    }
});