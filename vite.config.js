import { defineConfig } from 'vite';

export default defineConfig({
    root: './demo',
    build: {
        outDir: '../dist', 
    },
    plugins: [],
    test: {
        globals: true,
        environment: 'jsdom', // Use jsdom for DOM-related tests
        setupFiles: './setupTests.ts', // Reference your setup file for global configurations
        include: ['../tests/**/*.{test,spec}.{js,ts}'], 
    },
});
